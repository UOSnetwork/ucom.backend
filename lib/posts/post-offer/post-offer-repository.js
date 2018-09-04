const models = require('../../../models');
const sequelize = models.sequelize;
const PostTypeDictionary = require('../post-type-dictionary');
const _ = require('lodash');
const uniqid = require('uniqid');

const POST_TYPE__OFFER = PostTypeDictionary.getTypeOffer();

class PostOfferRepository {


  static async createNewOffer(data, user) {
    data['id'] = null;
    data['user_id'] = user.id;
    data['current_rate'] = 0;
    data['current_vote'] = 0;
    data['post_type_id'] = POST_TYPE__OFFER;

    const newPost = await PostOfferRepository.getMainModel().create(data);

    data['post_id'] = newPost.id;
    await this.getPostOfferModel().create(data);

    if (data['post_users_team']) {
      data['post_users_team'].forEach(async (user) => {
        const usersTeam = {
          'post_id': newPost.id,
          'user_id': +user.id,
        };

        await this.getPostUsersTeamModel().create(usersTeam);
      });
    }

    await newPost.update({
      'blockchain_id': this.getUniqId(newPost.id)
    });

    return newPost;

    // await sequelize.transaction(async transaction => {
    //   newPost = await PostOfferRepository.getMainModel().create(data, transaction);
    //
    //   data['post_id'] = newPost.id;
    //
    //   // const offerPostData = _.pick(data, [
    //   //   'action_button_title',
    //   //   'action_button_url',
    //   //   'post_id',
    //   //   'action_duration_in_days',
    //   // ]);
    //
    //   offerPost = await this.getPostOfferModel().build({
    //     'action_button_title': '12345'
    //   }, transaction);
    //
    //   const errors = await offerPost.validate();
    //
    //   await offerPost.save(transaction);
    //
    //   const dadsa = 0;
    // });
  }

  static async findOneById(post_id, isRaw = false) {
    const result = await this.getMainModel().findOne({
      where: {
        id: post_id,
        post_type_id: POST_TYPE__OFFER
      },
      include: [
        {
          model: this.getPostOfferModel()
        },
        {
          model: this.getPostUsersTeamModel(),
          as: 'post_users_team',
          include: [
            {
              model: models['Users'],
              attributes: [
                'id', 'account_name', 'first_name', 'last_name', 'nickname', 'avatar_filename',
              ],
            }
          ]
        }
      ],
    });

    if (!result) {
      return null;
    }

    return isRaw ? result.toJSON() : result;
  }

  async updateRelations(user, deltaData, modelName, userData) {
    await models.sequelize
      .transaction(async transaction => {

        // Update addresses
        await Promise.all([
          deltaData.deleted.map(async data => {
            await data.destroy({ transaction });
          }),

          deltaData.added.map(async data => {

            data['user_id'] = user.id;

            let newModel = models[modelName].build(data);
            await newModel.save(); // TODO check is transaction work
          }),

          deltaData.changed.map(async data => {
            const toUpdate = user[modelName].find(_data => _data.id === data.id);
            await toUpdate.update(data, { transaction });
          })
        ]);

        if (userData) {
          return await user.update(userData, { transaction });
        }

        return true;
      })
  }

  static async findAllByAuthor(userId, isRaw = true) {
    const data = await this.getMainModel().findAll({
      where: {
        user_id: userId,
        post_type_id: POST_TYPE__OFFER
      },
      include: [
        {
          model: this.getPostOfferModel()
        }
      ],
      order: [
        ['id', 'DESC']
      ],
    });

    if (isRaw) {
      return data.map(data => {
        return data.toJSON();
      });
    }

    return data;
  }

  static async findLast(isRaw = true) {
    const data = await this.getMainModel().findOne({
      where: {
        post_type_id: POST_TYPE__OFFER
      },
      include: [
        {
          model: this.getPostOfferModel()
        }
      ],
      order: [
        ['id', 'DESC']
      ],
      limit: 1
    });

    return isRaw ? data.toJSON() : data;
  }

  static async findLastByAuthor(user_id, isRaw = true) {
    const data = await this.getMainModel().findOne({
      where: {
        user_id,
        post_type_id: POST_TYPE__OFFER
      },
      include: [
        {
          model: this.getPostOfferModel()
        },
        {
          model: this.getPostUsersTeamModel(),
          as: 'post_users_team',
          include: [
            {
              model: models['Users'],
              attributes: [
                'id', 'account_name', 'first_name', 'last_name', 'nickname', 'avatar_filename',
              ],
            }
          ]
        }
      ],
      order: [
        ['id', 'DESC']
      ],
      limit: 1
    });

    if (!data) {
      return data;
    }

    return isRaw ? data.toJSON() : data;
  }

  static getUniqId(postId) {
    const typePrefix = 'pstos';
    const prefix = `${typePrefix}${postId}-`;

    return uniqid(prefix);
  }

  static getMainModel() {
    return models['posts'];
  }

  static getPostOfferModel() {
    return models['post_offer']
  }

  static getPostUsersTeamModel() {
    return models['post_users_team'];
  }
}

module.exports = PostOfferRepository;