export {};

const mockHelper = require('../helpers/mock-helper');

const { app, server } = require('../../../graphql-app');

const postsGenerator    = require('../../generators/posts-generator');
const commentsGenerator = require('../../generators/comments-generator');

const seedsHelper   = require('../helpers/seeds-helper');
const commonHelper  = require('../helpers/common-helper');
const commentsHelper  = require('../helpers/comments-helper');

require('cross-fetch/polyfill');
const apolloClient = require('apollo-boost').default;
const { gql } = require('apollo-boost');
const { InMemoryCache } = require('apollo-cache-inmemory');

mockHelper.mockAllTransactionSigning();
mockHelper.mockBlockchainPart();

let userVlad;
let userJane;

const JEST_TIMEOUT = 20000;

describe('#Feeds. #GraphQL', () => {
  let serverApp;
  let client;

  beforeAll(async () => {
    [userVlad, userJane] = await seedsHelper.beforeAllRoutine();

    serverApp = await app.listen({ port: 4001 });

    client = new apolloClient({
      request: async (operation) => {
        operation.setContext({
          headers: {
            Authorization: `Bearer ${userVlad.token}`,
          },
        });
      },
      uri: `http://127.0.0.1:4001${server.graphqlPath}`,
      cache: new InMemoryCache({
        addTypename: false,
      }),
    });
  });

  afterAll(async () => {
    await Promise.all([
      seedsHelper.sequelizeAfterAll(),
      serverApp.close(),
    ]);
  });

  beforeEach(async () => {
    await seedsHelper.initUsersOnly();
  });

  describe('Posts depth = 0 comments', () => {
    describe('Positive', () => {
      it('#smoke - should get all depth = 0 comments', async () => {
        const targetUser = userVlad;
        const directPostAuthor = userJane;

        const promisesToCreatePosts = [
          postsGenerator.createMediaPostByUserHimself(targetUser),
          postsGenerator.createUserDirectPostForOtherUser(directPostAuthor, targetUser, null, true),
        ];

        const [postOneId, postTwo] = await Promise.all(promisesToCreatePosts);

        const [commentOne] = await Promise.all([
          commentsGenerator.createCommentForPost(postOneId, userJane),
          commentsGenerator.createCommentForPost(postOneId, userJane),
          commentsGenerator.createCommentForPost(postOneId, userJane),

          // disturbance
          commentsGenerator.createCommentForPost(postTwo.id, userJane),
        ]);

        await Promise.all([
          commentsGenerator.createCommentOnComment(postOneId, commentOne.id, userJane),
          commentsGenerator.createCommentOnComment(postOneId, commentOne.id, userJane),
        ]);

        const page: number    = 1;
        const perPage: number = 10;

        const query = gql`
query {
  feed_comments(commentable_id: ${postOneId}, page: ${page}, per_page: ${perPage}) {
    data {
      id
      description
      current_vote
      blockchain_id
      commentable_id
      created_at
      activity_user_comment
      organization
      depth
      organization_id
      parent_id
      path
      updated_at
      user_id

      metadata {
        next_depth_total_amount
      }

      User {
        id
        account_name
        first_name
        last_name
        nickname
        avatar_filename
        current_rate
      }

      myselfData {
        myselfVote
      }
    }
    metadata {
      page
      per_page
      has_more
    }
  }
}
    `;

        const response = await client.query({ query });
        const data = response.data;

        // #task - check all comments with metadata structure as separate helper
        expect(data.feed_comments).toBeDefined();
        expect(data.feed_comments.data).toBeDefined();

        expect(data.feed_comments.data.length).toBe(3);

        const options = {
          myselfData: true,
          postProcessing: 'list',
          comments: true,
          commentsMetadataExistence: true,
          commentItselfMetadata: true,
        };

        await commonHelper.checkManyCommentsPreviewWithRelations(
          data.feed_comments.data,
          options,
        );

        const commentWithComments = data.feed_comments.data.find(item => item.id === commentOne.id);

        expect(commentWithComments.metadata.next_depth_total_amount).toBe(2);
      }, JEST_TIMEOUT);
    });
  });

  describe('Users wall feed', () => {
    describe('Positive', () => {

      it('#smoke - should get all user-related posts as Guest', async () => {
        const targetUser = userVlad;
        const directPostAuthor = userJane;

        const promisesToCreatePosts = [
          postsGenerator.createMediaPostByUserHimself(targetUser),
          postsGenerator.createUserDirectPostForOtherUser(directPostAuthor, targetUser, null, true),
        ];

        const [postOneId, postTwo] = await Promise.all(promisesToCreatePosts);

        const [commentOne, commentTwo] = await Promise.all([
          commentsGenerator.createCommentForPost(
            postOneId,
            userJane,
            'Jane comments - for post one',
          ),
          commentsGenerator.createCommentForPost(postOneId, userJane, 'Comment two for post two'),
          commentsGenerator.createCommentForPost(postTwo.id, userJane, 'Comment two for post two'),
        ]);

        const commentOnComment =
          await commentsGenerator.createCommentOnComment(postOneId, commentOne.id, userJane);

        await commentsHelper.requestToUpvoteComment(postOneId, commentOne.id, userVlad);

        const query = gql`
query {
  user_wall_feed(user_id: 1, page: 1, per_page: 3) {
    data {
     id
     title
     post_type_id
     leading_text
     description
     user_id
     blockchain_id

     created_at
     updated_at

     main_image_filename
     entity_images


     comments_count
     current_vote
     current_rate

     entity_id_for
     entity_name_for

     organization_id

     comments {
      data {
        id
        description
        current_vote

        metadata {
          next_depth_total_amount
        }

        User {
          id
          account_name
          first_name
          last_name
          nickname
          avatar_filename
          current_rate
        }

        blockchain_id
        commentable_id
        created_at
        activity_user_comment
        organization

        depth
        myselfData {
          myselfVote
        }
        organization_id
        parent_id
        path
        updated_at
        user_id
      }
      metadata {
        page
        per_page
        has_more
      }
     }

     myselfData {
      myselfVote
      join
      organization_member
     }

     User {
      id
      account_name
      first_name
      last_name
      nickname
      avatar_filename
      current_rate
     }
   }

    metadata {
      page
      per_page
      has_more
    }
  }
}
    `;

        const response = await client.query({ query });
        const data = response.data;

        const options = {
          myselfData: true,
          postProcessing: 'list',
          comments: true,
          commentsMetadataExistence: true,
          commentItselfMetadata: true,
        };

        const postOne = data.user_wall_feed.data.find(item => item.id === postOneId);

        // Only first level comments (depth = 0)
        const commentOnCommentExistence =
          postOne.comments.data.some(item => item.id === commentOnComment.id);
        expect(commentOnCommentExistence).toBeFalsy();
        expect(postOne.comments.data.length).toBe(2);

        const postOneCommentsMetadata = postOne.comments.metadata;
        expect(postOneCommentsMetadata).toBeDefined();

        expect(postOneCommentsMetadata.page).toBe(1);
        expect(postOneCommentsMetadata.per_page).toBe(10);
        expect(postOneCommentsMetadata.has_more).toBeFalsy();

        const commentWithComment = postOne.comments.data.find(item => item.id === commentOne.id);
        const commentWithoutComment = postOne.comments.data.find(item => item.id === commentTwo.id);

        expect(commentWithComment.metadata).toBeDefined();
        expect(commentWithComment.metadata.next_depth_total_amount).toBe(1);

        expect(commentWithoutComment.metadata).toBeDefined();
        expect(commentWithoutComment.metadata.next_depth_total_amount).toBe(0);

        await commonHelper.checkPostsListFromApi(
          data.user_wall_feed.data,
          promisesToCreatePosts.length,
          options,
        );

      }, JEST_TIMEOUT);
    });
  });
});