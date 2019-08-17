/* eslint-disable no-console */
import { TotalParametersResponse } from '../../../common/interfaces/response-interfaces';

import EosApi = require('../../../eos/eosApi');
import knex = require('../../../../config/knex');
import UsersModelProvider = require('../../../users/users-model-provider');
import OrganizationsModelProvider = require('../../../organizations/service/organizations-model-provider');
import CommentsModelProvider = require('../comments-model-provider');
import PostsModelProvider = require('../../../posts/service/posts-model-provider');

const { PublicationsApi } = require('ucom-libs-wallet').Content;
const { EosClient, WalletApi } = require('ucom-libs-wallet');
const moment = require('moment');

class CommentsResendingService {
  public static async resendComments(
    createdAtLessOrEqualThan: string,
    limit: number,
    printPushResponse: boolean = false,
    offset: number = 0,
  ): Promise<TotalParametersResponse> {
    EosApi.initBlockchainLibraries();

    const stateBefore = await WalletApi.getAccountState(EosApi.getHistoricalSenderAccountName());
    console.log(`Account sources: ${EosApi.getHistoricalSenderAccountName()}`);
    console.dir(stateBefore.resources);

    const manyPosts = await this.getManyComments(createdAtLessOrEqualThan, limit, offset);

    await this.resendCommentsOneByOne(manyPosts, printPushResponse);

    return {
      totalProcessedCounter: manyPosts.length,
      totalSkippedCounter: 0,
    };
  }

  private static getManyComments(createdAtLessOrEqualThan: string, limit: number, offset: number) {
    return knex(`${CommentsModelProvider.getTableName()} AS p`)
      .select([
        'p.blockchain_id as blockchain_id',
        'p.description as description',
        'p.entity_images AS entity_images',
        'p.created_at AS created_at',
        'p.updated_at AS updated_at',

        'u.account_name AS account_name_from',
        'o.blockchain_id AS organization_blockchain_id',

        'parent.blockchain_id AS parent_blockchain_id',
        'commentable.blockchain_id AS commentable_blockchain_id',
      ])
      .innerJoin(`${UsersModelProvider.getTableName()} AS u`, 'u.id', 'p.user_id')
      .innerJoin(`${PostsModelProvider.getTableName()} AS commentable`, 'commentable.id', 'p.commentable_id')
      .leftJoin(`${OrganizationsModelProvider.getTableName()} AS o`, 'o.id', 'p.organization_id')
      .leftJoin(`${CommentsModelProvider.getTableName()} AS parent`, 'parent.id', 'p.parent_id')
      .where('p.created_at', '<=', createdAtLessOrEqualThan)
      .orderBy('p.id', 'ASC')
      .limit(limit)
      .offset(offset)
    ;
  }

  private static async resendCommentsOneByOne(manyComments, printPushResponse: boolean) {
    let processedCount = 0;
    for (const comment of manyComments) {
      if (processedCount % 100 === 0) {
        console.log(`Current processed count is: ${processedCount}`);
      }

      comment.created_at = moment(comment.created_at).utc().format();
      comment.updated_at = moment(comment.updated_at).utc().format();

      const signedTransaction = await this.getSignedUsingIsOrganization(comment);
      const pushingResponse = await EosClient.pushTransaction(signedTransaction);

      if (printPushResponse) {
        console.log(`Transaction id: ${pushingResponse.transaction_id}`);
        console.dir(JSON.stringify(pushingResponse.processed.action_traces[0].act.data));
      }

      processedCount += 1;
    }
  }

  private static async getSignedUsingIsOrganization(comment) {
    const isReply = comment.parent_blockchain_id !== null;
    const parentBlockchainId = isReply ? comment.parent_blockchain_id : comment.commentable_blockchain_id;

    if (comment.organization_blockchain_id === null) {
      return PublicationsApi.signResendCommentFromAccount(
        comment.account_name_from,
        EosApi.getHistoricalSenderPrivateKey(),
        comment,
        comment.blockchain_id,
        parentBlockchainId,
        isReply,
      );
    }

    return PublicationsApi.signResendCommentFromOrganization(
      comment.account_name_from,
      EosApi.getHistoricalSenderPrivateKey(),
      comment,
      comment.blockchain_id,
      parentBlockchainId,
      comment.organization_blockchain_id,
      isReply,
    );
  }
}

export = CommentsResendingService;
