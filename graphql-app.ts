import { RequestQueryDto } from './lib/api/filters/interfaces/query-filter-interfaces';

// const {
//   parseResolveInfo,
// } = require('graphql-parse-resolve-info');

const { ApolloServer, gql } = require('apollo-server-express');

const postsFetchService    = require('./lib/posts/service/posts-fetch-service');
const commentsFetchService = require('./lib/comments/service/comments-fetch-service');

const authService = require('./lib/auth/authService');
const graphQLJSON = require('graphql-type-json');

// #task - generate field list from model and represent as object, not string
const typeDefs = gql`
  type Query {
    user_wall_feed(user_id: Int!, page: Int!, per_page: Int!): posts!

    feed_comments(commentable_id: Int!, page: Int!, per_page: Int!): comments!
  }

  scalar JSON

  type Post {
    id: Int!
    title: String
    description: String
    leading_text: String

    current_vote: Float!
    current_rate: Float!
    comments_count: Int!

    main_image_filename: String
    entity_images: JSON

    user_id: Int!
    post_type_id: Int!
    blockchain_id: String!
    organization_id: Int
    created_at: String!
    updated_at: String!

    entity_id_for: Int
    entity_name_for: String

    User: User!

    myselfData: MyselfData

    comments: comments
  }

  type User {
    id: Int!
    account_name: String!
    first_name: String
    last_name: String
    nickname: String
    avatar_filename: String
    current_rate: Float!
  }

  type Comment {
    id: Int!,
    description: String!
    current_vote: Float!

    User: User!
    blockchain_id: String!
    commentable_id: Int!
    created_at: String!

    activity_user_comment: JSON
    organization: JSON

    depth: Int!
    myselfData: MyselfData
    organization_id: Int
    parent_id: Int
    path: JSON
    updated_at: String!
    user_id: Int!

    metadata: comment_metadata!
  }

  type posts {
    data: [Post!]!
    metadata: metadata!
  }

  type comments {
    data: [Comment!]!
    metadata: metadata!
  }

  type MyselfData {
    myselfVote: String
    join: Boolean
    organization_member: Boolean
    repost_available: Boolean

    follow: Boolean
    myFollower: Boolean

    editable: Boolean
    member:   Boolean
  }

  type metadata {
    page: Int!,
    per_page: Int!,
    has_more: Boolean!
  }

  type comment_metadata {
    next_depth_total_amount: Int!
  }
`;

const resolvers = {
  JSON: graphQLJSON,

  Query: {
    async feed_comments(
      // @ts-ignore
      parent,
      // @ts-ignore
      args,
      // @ts-ignore
      ctx,
      // @ts-ignore
      info,
    ) {
      // @ts-ignore

      const commentsQuery = {
        depth:    0, // always for first level comments
        page:     args.page,
        per_page: args.per_page,
      };

      const currentUserId: number = authService.extractCurrentUserByToken(ctx.req);

      return await commentsFetchService.findAndProcessCommentsByPostId(
        args.commentable_id,
        currentUserId,
        commentsQuery,
      );
    },
    async user_wall_feed(
      // @ts-ignore
      parent,
      // @ts-ignore
      args,
      // @ts-ignore
      ctx,
      // @ts-ignore
      info,
    ) {

      const currentUserId: number = authService.extractCurrentUserByToken(ctx.req);

      const postsQuery: RequestQueryDto = {
        page:     args.page,
        per_page: args.per_page,
        include: [
          'comments',
        ],
      };

      // const parsedResolveInfoFragment = parseResolveInfo(info);
      // @ts-ignore
      // const commentsArgs =
      // parsedResolveInfoFragment.fieldsByTypeName.posts.data.fieldsByTypeName.Post.comments.args;

      let res;
      try {
        res = await postsFetchService.findAndProcessAllForUserWallFeed(
          args.user_id,
          currentUserId,
          postsQuery,
        );
      } catch (err) {
        // @ts-ignore
        const b = 0;
        // #task - log and rethrow

        throw err;
      }

      return res;
    },
  },
};

const express = require('express');

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: false,
  context: ({ req }) => {
    return { req };
  },
});

server.applyMiddleware({ app });

export = {
  app,
  server,
};