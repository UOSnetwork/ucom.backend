const models = require('../../../models');
const ENTITY_NAME = 'posts     ';
const TABLE_NAME = 'posts';

const POST_STATS_TABLE_NAME       = 'post_stats';
const POST_OFFER_TABLE_NAME       = 'post_offer';
const POST_USERS_TEAM_TABLE_NAME  = 'post_users_team';

const MEDIA_POST_BLOCKCHAIN_ID_PREFIX   = 'pstms';
const POST_OFFER_BLOCKCHAIN_ID_PREFIX   = 'pstos';
const DIRECT_POST_BLOCKCHAIN_ID_PREFIX  = 'pstdr';

class PostsModelProvider {

  /**
   *
   * @return {string}
   */
  static getMediaPostBlockchainIdPrefix() {
    return MEDIA_POST_BLOCKCHAIN_ID_PREFIX;
  }

  /**
   *
   * @return {string}
   */
  static getPostOfferBlockchainIdPrefix() {
    return POST_OFFER_BLOCKCHAIN_ID_PREFIX;
  }

  /**
   *
   * @return {string}
   */
  static getDirectPostBlockchainIdPrefix() {
    return DIRECT_POST_BLOCKCHAIN_ID_PREFIX;
  }

  /**
   *
   * @return {string}
   */
  static getEntityName() {
    return ENTITY_NAME;
  }

  /**
   *
   * @return {string}
   */
  static getModelName() {
    return TABLE_NAME;
  }

  /**
   *
   * @return {Object}
   */
  static getModel() {
    return models[TABLE_NAME];
  }

  /**
   *
   * @return {Object}
   */
  static getPostStatsModel() {
    return models[POST_STATS_TABLE_NAME];
  }

  /**
   *
   * @return {Object}
   */
  static getPostOfferModel() {
    return models[POST_OFFER_TABLE_NAME];
  }

  /**
   *
   * @return {Object}
   */
  static getPostUsersTeamModel() {
    return models[POST_USERS_TEAM_TABLE_NAME];
  }

  /**
   *
   * @return {Object}
   */
  static getPostsStatsInclude() {
    return {
      attributes: ['comments_count'],
      model: this.getPostStatsModel(),
      as:    POST_STATS_TABLE_NAME,
    };
  }

  /**
   *
   * @return {Object[]}
   */
  // static getPostOfferInclude() {
  //   return [
  //     {
  //       model: this.getPostOfferModel()
  //     },
  //     {
  //       model: this.getPostUsersTeamModel(),
  //       as: POST_USERS_TEAM_TABLE_NAME,
  //       include: [
  //         {
  //           model: models.Users,
  //           attributes: models.Users.getFieldsForPreview(),
  //         }
  //       ]
  //     }
  //   ];
  // }

  static getPostOfferItselfInclude() {
    return {
      model: this.getPostOfferModel()
    };
  }
}

module.exports = PostsModelProvider;