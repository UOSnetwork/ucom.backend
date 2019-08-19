import { IActivityOptions } from './interfaces/activity-interfaces';
import { UserModel } from '../users/interfaces/model-interfaces';
import { IRequestBody } from '../common/interfaces/common-types';
import { AppError } from '../api/errors';

const { TransactionFactory } = require('ucom-libs-social-transactions');
const eosBlockchainUniqid = require('../eos/eos-blockchain-uniqid');

class EosTransactionService {
  public static async appendSignedUserVotesContent(
    user: UserModel,
    body: IRequestBody,
    contentBlockchainId: string,
    interactionType: number,
  ): Promise<void> {
    if (body.signed_transaction) {
      return;
    }

    body.signed_transaction = await TransactionFactory.getSignedUserToContentActivity(
      user.account_name,
      user.private_key,
      contentBlockchainId,
      interactionType,
    );
  }

  public static getEosVersionBasedOnSignedTransaction(signedTransaction: string): IActivityOptions {
    if (!signedTransaction) {
      throw new AppError('Signed transaction must be determined');
    }

    return {
      eosJsV2: signedTransaction.includes('serializedTransaction'),
    };
  }

  public static async appendSignedUserCreatesRepost(
    body: IRequestBody,
    user: UserModel,
    parentContentBlockchainId: string,
  ): Promise<void> {
    body.blockchain_id = eosBlockchainUniqid.getUniqidForRepost();

    body.signed_transaction = await TransactionFactory.getSignedUserCreatesRepostOtherPost(
      user.account_name,
      user.private_key,
      body.blockchain_id,
      parentContentBlockchainId,
    );
  }

  public static async appendSignedLegacyUserCreatesDirectPostForOtherUser(
    body: IRequestBody,
    user: UserModel,
    accountNameFor: string,
  ): Promise<void> {
    body.blockchain_id = eosBlockchainUniqid.getUniqidForDirectPost();

    body.signed_transaction = await TransactionFactory.getSignedDirectPostCreationForUser(
      user.account_name,
      user.private_key,
      accountNameFor,
      body.blockchain_id,
    );
  }

  public static async appendSignedUserCreatesDirectPostForOrg(
    body: IRequestBody,
    user: UserModel,
    orgBlockchainIdTo: string,
  ): Promise<void> {
    body.blockchain_id = eosBlockchainUniqid.getUniqidForDirectPost();

    body.signed_transaction = await TransactionFactory.getSignedDirectPostCreationForOrg(
      user.account_name,
      user.private_key,
      orgBlockchainIdTo,
      body.blockchain_id,
    );
  }
}

export = EosTransactionService;
