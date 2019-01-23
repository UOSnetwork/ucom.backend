import { gql } from 'apollo-boost';
import responseHelper from './response-helper';

const request = require('supertest');
const server = require('../../../app');


const fileToUploadHelper = require('./file-to-upload-helper.ts');

const apiV1Prefix = '/api/v1';
const apiV2Prefix = '/api/v2';

const checkAccountRoute = '/api/v1/auth/registration/validate-account-name';
const registrationRoute = '/api/v1/auth/registration';
const postsUrl = `${apiV1Prefix}/posts`;
const usersUrl = `${apiV1Prefix}/users`;
const organizationsUrl = `${apiV1Prefix}/organizations`;
const myselfUrl = `${apiV1Prefix}/myself`;

const communityUrl = `${apiV1Prefix}/community`;
const partnershipUrl = `${apiV1Prefix}/partnership`;
const blockchainUrl = `${apiV1Prefix}/blockchain`;

const tagsUrl = `${apiV1Prefix}/tags`;

const myselfBlockchainTransactionsUrl = `${myselfUrl}/blockchain/transactions`;

class RequestHelper {
  public static getCommentOnCommentGraphQlQuery(
    postId: number,
    parentId: number,
    parentDepth: number,
    page: number,
    perPage: number,
  ): any {
    return gql`
query {
  comments_on_comment(commentable_id: ${postId}, parent_id: ${parentId}, parent_depth: ${parentDepth}, page: ${page}, per_page: ${perPage}) {
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
  }

  public static makeRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i += 1) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }

  /**
   *
   * @returns {string}
   */
  static getTagsRootUrl() {
    return tagsUrl;
  }

  /**
   *
   * @param {string} tagTitle
   */
  static getTagsWallFeedUrl(tagTitle) {
    return `${RequestHelper.getTagsRootUrl()}/${tagTitle}/wall-feed`;
  }

  /**
   *
   * @param {string} tagTitle
   */
  static getTagsOrgUrl(tagTitle) {
    return `${RequestHelper.getTagsRootUrl()}/${tagTitle}/organizations`;
  }

  /**
   *
   * @param {string} tagTitle
   */
  static getTagsUsersUrl(tagTitle) {
    return `${RequestHelper.getTagsRootUrl()}/${tagTitle}/users`;
  }

  /**
   *
   * @param {string} tagTitle
   * @returns {string}
   */
  static getOneTagUrl(tagTitle) {
    return `${RequestHelper.getTagsRootUrl()}/${tagTitle}`;
  }

  /**
   *
   * @param {string} url
   * @param {Object} myself
   * @param {boolean} getOnlyData
   * @returns {Promise<*>}
   */
  static async makeGetRequestForList(url, myself = null, getOnlyData = true) {
    const req = request(server)
      .get(url);
    if (myself) {
      this.addAuthToken(req, myself);
    }

    const res = await req;

    responseHelper.expectValidListResponse(res);

    return getOnlyData ? res.body.data : res.body;
  }

  /**
   *
   * @param {string} url
   * @param {number} expectedStatus
   * @param {Object} myself
   * @returns {Promise<*>}
   */
  static async makeGetRequest(url, expectedStatus, myself = null) {
    const req = request(server)
      .get(url);
    if (myself) {
      this.addAuthToken(req, myself);
    }

    const res = await req;
    responseHelper.expectStatusToBe(res, expectedStatus);

    return res;
  }

  /**
   *
   * @return {string}
   */
  static getMyselfBlockchainTransactionsUrl() {
    return myselfBlockchainTransactionsUrl;
  }

  /**
   *
   * @return {string}
   */
  static getBlockchainNodesListUrl() {
    return `${blockchainUrl}/nodes`;
  }

  /**
   *
   * @param {number} postId
   * @return {string}
   */
  static getCreateRepostUrl(postId) {
    const onePostUrl = this.getOnePostUrl(postId);

    return `${onePostUrl}/repost`;
  }

  /**
   *
   * @param {Object} req
   * @param {Object} user
   */
  static addAuthToken(req, user) {
    req
      .set('Authorization', `Bearer ${user.token}`);
  }

  /**
   *
   * @param {string} url
   * @param {Object} fields
   * @return {Promise<Object>}
   */
  static async makePostGuestRequestWithFields(url, fields) {
    const req = request(server)
      .post(url);
    this.addFieldsToRequest(req, fields);

    return req;
  }

  /**
   *
   * @param {Object} req
   * @param {Object} fields
   */
  static addFieldsToRequest(req, fields) {
    // eslint-disable-next-line guard-for-in
    for (const field in fields) {
      req.field(field, fields[field]);
    }
  }

  /**
   *
   * @param {Object} req
   * @param {string} field
   */
  static addSampleMainImageFilename(req, field = 'main_image_filename') {
    req
      .attach(field, fileToUploadHelper.getSampleFilePathToUpload());
  }

  /**
   *
   * @return {string}
   */
  static getMyselfUrl() {
    return myselfUrl;
  }

  /**
   *
   * @param {number} id
   * @return {string}
   */
  static getConfirmNotificationUrl(id) {
    return `${this.getMyselfNotificationsList()}/${id}/confirm`;
  }

  /**
   *
   * @param {number} id
   * @return {string}
   */
  static getMarkAsSeenNotificationUrl(id) {
    return `${this.getMyselfNotificationsList()}/${id}/seen`;
  }

  /**
   *
   * @param {number} id
   * @return {string}
   */
  static getDeclineNotificationUrl(id) {
    return `${this.getMyselfNotificationsList()}/${id}/decline`;
  }

  /**
   *
   * @param {number} id
   * @return {string}
   */
  static getPendingNotificationUrl(id) {
    return `${this.getMyselfNotificationsList()}/${id}/pending`;
  }

  /**
   *
   * @param {number} targetUserId
   * @return {string}
   */
  static getOneUserWallFeed(targetUserId) {
    return `${usersUrl}/${targetUserId}/wall-feed`;
  }

  /**
   *
   * @return {string}
   */
  static getMyselfNotificationsList() {
    return `${myselfUrl}/notifications`;
  }

  /**
   *
   * @return {string}
   */
  static getMyselfNewsFeedUrl() {
    return `${myselfUrl}/news-feed`;
  }

  /**
   *
   * @param {number} targetOrgId
   * @return {string}
   */
  static getOneOrgWallFeed(targetOrgId) {
    return `${organizationsUrl}/${targetOrgId}/wall-feed/`;
  }

  /**
   *
   * @param {number} totalAmount
   * @param {number} perPage
   * @return {number}
   */
  static getLastPage(totalAmount, perPage) {
    return +Math.floor(totalAmount / perPage);
  }

  /**
   *
   * @param {number} page
   * @param {number} perPage
   * @returns {Promise<Object>}
   */
  static getPaginationQueryString(page, perPage) {
    const params: string[] = [];

    if (page) {
      params.push(`page=${page}`);
    }

    if (perPage) {
      params.push(`per_page=${perPage}`);
    }

    return `?${params.join('&')}`;
  }

  /**
   *
   * @param {string} query
   * @returns {string}
   */
  static getCommunitySearchUrl(query) {
    return `${communityUrl}/search?q=${query}`;
  }

  /**
   *
   * @param {number} orgId
   * @return {string}
   */
  static getOrgFollowUrl(orgId) {
    return `${this.getOrganizationsUrl()}/${orgId}/follow`;
  }

  /**
   *
   * @param {number} orgId
   * @return {string}
   */
  static getOrgUnfollowUrl(orgId) {
    return `${this.getOrganizationsUrl()}/${orgId}/unfollow`;
  }

  /**
   *
   * @param {string} query
   * @returns {string}
   */
  static getPartnershipSearchUrl(query) {
    return `${partnershipUrl}/search?q=${query}`;
  }

  /**
   *
   * @param {number} orgId
   * @return {string}
   */
  static getOrganizationsPostsUrl(orgId) {
    return `${apiV1Prefix}/organizations/${orgId}/posts`;
  }

  /**
   *
   * @param {number} userId
   * @return {string}
   */
  static getUserPostsUrl(userId) {
    return `/api/v1/users/${userId}/posts`;
  }

  /**
   *
   * @return {string}
   */
  static getBlockchainContentUniqidUrl() {
    return `${blockchainUrl}/content/uniqid`;
  }

  /**
   *
   * @return {string}
   */
  static getOrganizationsUrl() {
    return `${apiV1Prefix}/organizations`;
  }

  /**
   *
   * @param {number} id
   * @return {string}
   */
  static getOneOrganizationUrl(id) {
    return `${this.getOrganizationsUrl()}/${id}`;
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   *
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  static async requestMyself(user) {
    const res = await request(server)
      .get(myselfUrl)
      .set('Authorization', `Bearer ${user.token}`);
    responseHelper.expectStatusOk(res);

    return res.body;
  }

  /**
   * @deprecated
   * @see requestUserByIdAsGuest
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  static async requestUserById(userId) {
    const res = await request(server)
      .get(this.getUserUrl(userId));
    responseHelper.expectStatusOk(res);

    return res.body;
  }

  /**
   *
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  static async requestUserByIdAsGuest(user) {
    const res = await request(server)
      .get(this.getUserUrl(user.id));
    responseHelper.expectStatusOk(res);

    return res.body;
  }

  /**
   *
   * @param {Object} myself
   * @param {Object} userToRequest
   * @returns {Promise<Object>}
   */
  static async requestUserByIdAsMyself(myself, userToRequest) {
    const res = await request(server)
      .get(this.getUserUrl(userToRequest.id))
      .set('Authorization', `Bearer ${myself.token}`);
    responseHelper.expectStatusOk(res);

    return res.body;
  }

  static getUserUrl(userId) {
    return `/api/v1/users/${userId}`;
  }

  static getFollowUrl(userId) {
    return `/api/v1/users/${userId}/follow`;
  }

  static getUnfollowUrl(userId) {
    return `/api/v1/users/${userId}/unfollow`;
  }

  static getJoinUrl(postId) {
    return `/api/v1/posts/${postId}/join`;
  }

  static getCheckAccountNameRoute() {
    return checkAccountRoute;
  }

  static getRegistrationRoute() {
    return registrationRoute;
  }

  static getPostsUrl() {
    return postsUrl;
  }

  /**
   *
   * @param {Object} user
   * @return {string}
   */
  static getUserDirectPostUrl(user) {
    return `${usersUrl}/${user.id}/posts`;
  }

  /**
   *
   * @param {number} orgId
   * @return {string}
   */
  static getOrgDirectPostUrl(orgId) {
    return `${organizationsUrl}/${orgId}/posts`;
  }

  static getUsersUrl() {
    return usersUrl;
  }

  /**
   *
   * @param {string} query
   * @returns {string}
   */
  static getUserSearchUrl(query) {
    return `${usersUrl}/search?q=${query}`;
  }

  static getOnePostUrl(postId) {
    return `${postsUrl}/${postId}`;
  }

  /**
   *
   * @param {number} postId
   * @returns {string}
   */
  static getCommentsUrl(postId) {
    return `/api/v1/posts/${postId}/comments`;
  }

  static getCommentsV2Url(postId: number): string {
    return `${apiV2Prefix}/posts/${postId}/comments`;
  }

  /**
   *
   * @param {number} postId
   * @param {number} commentId
   * @returns {string}
   */
  static getCommentOnCommentUrl(postId, commentId) {
    return `/api/v1/posts/${postId}/comments/${commentId}/comments`;
  }
}

export = RequestHelper;
