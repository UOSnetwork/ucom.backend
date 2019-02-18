"use strict";
const winston_1 = require("../../../config/winston");
const knex = require("../../../config/knex");
const RepositoryHelper = require("../../common/repository/repository-helper");
const TABLE_NAME = 'posts_current_params';
class PostsCurrentParamsRepository {
    static async getPostCurrentStatsByPostId(postId) {
        const data = await knex(TABLE_NAME).where('post_id', postId).first();
        if (!data) {
            winston_1.ApiLogger.error(`There is no stats record for post with ID ${postId} but must be`);
            return null;
        }
        RepositoryHelper.convertStringFieldsToNumbers(data, this.getNumericalFields());
        return data;
    }
    static async insertRowForNewPost(postId) {
        const data = {
            post_id: postId,
        };
        await knex(TABLE_NAME).insert(data);
    }
    static getNumericalFields() {
        return [
            'id',
            'post_id',
            'importance_delta',
            'activity_index_delta',
            'upvotes_delta',
        ];
    }
}
module.exports = PostsCurrentParamsRepository;