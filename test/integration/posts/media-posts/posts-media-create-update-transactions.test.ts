import SeedsHelper = require('../../helpers/seeds-helper');
import PostsGenerator = require('../../../generators/posts-generator');
import knex = require('../../../../config/knex');
import UsersModelProvider = require('../../../../lib/users/users-model-provider');
import PostsModelProvider = require('../../../../lib/posts/service/posts-model-provider');
import CommonChecker = require('../../../helpers/common/common-checker');
import PostsRepository = require('../../../../lib/posts/posts-repository');
import PostsRestRequest = require('../../../helpers/posts/posts-rest-request');
import UsersActivityCommonHelper = require('../../../helpers/users/activity/users-activity-common-helper');

const { ContentTypeDictionary } = require('ucom-libs-social-transactions');

const { PublicationsApi } = require('ucom-libs-wallet').Content;
const { EventsIds } = require('ucom.libs.common').Events.Dictionary;

const ActivityGroupDictionary   = require('../../../../lib/activity/activity-group-dictionary');

let userVlad;

const JEST_TIMEOUT = 15000;
// @ts-ignore
const JEST_TIMEOUT_DEBUG = JEST_TIMEOUT * 100;

describe('Create/update media posts and push content to the blockchain', () => {
  beforeAll(async () => {
    await SeedsHelper.noGraphQlNoMocking();
  });
  afterAll(async () => {
    await SeedsHelper.afterAllWithoutGraphQlNoConnectionsKill();
  });
  beforeEach(async () => {
    [userVlad] = await SeedsHelper.beforeAllRoutine();
  });

  describe('Media post creation with a transaction', () => {
    describe('Positive', () => {
      it('create media post providing a transaction', async () => {
        const content = {
          title:          'Cool sample post',
          description:    'Cool sample post description #winter #summer',
          leading_text:   '',
          entity_images:  {},
          entity_tags:    ['winter', 'summer'],
        };

        const { signed_transaction, blockchain_id } = await PublicationsApi.signCreatePublicationFromUser(
          userVlad.account_name,
          userVlad.private_key,
          content,
        );

        const postRequestBody = {
          ...content,
          post_type_id:       ContentTypeDictionary.getTypeMediaPost(),
          signed_transaction,
          blockchain_id,
        };

        const postId = await PostsGenerator.createMediaPostWithGivenFields(userVlad, postRequestBody);
        const post = await PostsRepository.findOnlyPostItselfById(postId);

        expect(post.blockchain_id).toBe(blockchain_id);

        const eventId = EventsIds.userCreatesMediaPostFromHimself();

        const activity = await knex(UsersModelProvider.getUsersActivityTableName())
          .where({
            activity_type_id:   ContentTypeDictionary.getTypeMediaPost(),
            activity_group_id:  ActivityGroupDictionary.getGroupContentCreation(),
            user_id_from:       userVlad.id,
            entity_id_to:       postId,
            entity_name:        PostsModelProvider.getEntityName(),
            event_id:           eventId,
          });

        CommonChecker.expectOnlyOneNotEmptyItem(activity);

        await UsersActivityCommonHelper.getProcessedActivity(userVlad.id, eventId);
      }, JEST_TIMEOUT);
    });
  });

  describe('Media post updating', () => {
    describe('Positive', () => {
      it('Media Post updating should lead to updating activity', async () => {
        const postId: number = await PostsGenerator.createMediaPostByUserHimself(userVlad);
        const postBefore = await PostsRepository.findOnlyPostItselfById(postId);

        const newPostState = {
          title:          'Cool sample post',
          description:    'Cool sample post description #winter #summer',
          leading_text:   '',
          entity_images:  {},
          entity_tags:    ['winter', 'summer'],
          blockchain_id:  postBefore.blockchain_id,
        };

        const signed_transaction = await PublicationsApi.signUpdatePublicationFromUser(
          userVlad.account_name,
          userVlad.private_key,
          newPostState,
          postBefore.blockchain_id,
        );

        const postRequestBody = {
          ...newPostState,
          post_type_id: ContentTypeDictionary.getTypeMediaPost(),

          signed_transaction,
        };

        await PostsRestRequest.updateMediaPostWithGivenFields(
          postId,
          userVlad,
          postRequestBody,
        );

        const postAfter = await PostsRepository.findOnlyPostItselfById(postId);

        expect(postAfter.blockchain_id).toBe(postBefore.blockchain_id);

        const eventId = EventsIds.userUpdatesMediaPostFromHimself();

        const activity = await knex(UsersModelProvider.getUsersActivityTableName())
          .where({
            activity_type_id:   ContentTypeDictionary.getTypeMediaPost(),
            activity_group_id:  ActivityGroupDictionary.getGroupContentUpdating(),
            user_id_from:       userVlad.id,
            entity_id_to:       postAfter.id,
            entity_name:        PostsModelProvider.getEntityName(),
            event_id:           eventId,
          });

        CommonChecker.expectOnlyOneNotEmptyItem(activity);

        await UsersActivityCommonHelper.getProcessedActivity(userVlad.id, eventId);
      }, JEST_TIMEOUT);
    });
  });
});

export {};
