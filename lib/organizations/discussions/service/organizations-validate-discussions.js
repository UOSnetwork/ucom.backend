"use strict";
const ucom_libs_common_1 = require("ucom.libs.common");
const errors_1 = require("../../../api/errors");
const OrganizationsRepository = require("../../repository/organizations-repository");
const PostsRepository = require("../../../posts/posts-repository");
const OrganizationsDiscussionsRepository = require("../repository/organizations-discussions-repository");
const allowedDiscussionsTypes = [
    ucom_libs_common_1.ContentTypesDictionary.getTypeMediaPost(),
];
const ALLOWED_DISCUSSIONS_AMOUNT_PER_ORG = 10;
class OrganizationsValidateDiscussions {
    static async validateDeleteRequest(orgModel, currentUserId) {
        const isOrgMember = await OrganizationsRepository.isOrgMember(currentUserId, orgModel.id);
        if (!isOrgMember) {
            throw new errors_1.HttpForbiddenError('Only author of organization is able to change discussions');
        }
    }
    static throwErrorIfMaxNumberOfPostsExceeded(orgModel, numberOfPosts) {
        if (numberOfPosts > ALLOWED_DISCUSSIONS_AMOUNT_PER_ORG) {
            throw new errors_1.BadRequestError(`Organization with ID ${orgModel.id} already has maximum allowed amount of discussions: ${ALLOWED_DISCUSSIONS_AMOUNT_PER_ORG}`);
        }
    }
    static async isItPossibleToAddOneMoreDiscussion(orgModel) {
        const discussionsAmount = await OrganizationsDiscussionsRepository.countDiscussions(orgModel.id);
        this.throwErrorIfMaxNumberOfPostsExceeded(orgModel, discussionsAmount + 1);
    }
    static async validateOneDiscussion(orgModel, postId, currentUserId) {
        if (!postId) {
            throw new errors_1.BadRequestError('Post ID field must be a valid number');
        }
        const [isOrgMember, post] = await Promise.all([
            OrganizationsRepository.isOrgMember(currentUserId, orgModel.id),
            PostsRepository.findOnlyPostItselfById(postId),
        ]);
        if (!isOrgMember) {
            throw new errors_1.HttpForbiddenError('Only community team member is able to change discussions');
        }
        if (post === null) {
            throw new errors_1.BadRequestError(`There is no post with ID: ${postId}`);
        }
        if (!~allowedDiscussionsTypes.indexOf(post.post_type_id)) {
            throw new errors_1.BadRequestError(`Post type ID is not allowed. Allowed types are: ${allowedDiscussionsTypes.join(', ')}`);
        }
    }
}
module.exports = OrganizationsValidateDiscussions;
