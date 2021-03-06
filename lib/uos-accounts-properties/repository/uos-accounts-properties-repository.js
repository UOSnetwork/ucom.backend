"use strict";
const UosAccountsModelProvider = require("../service/uos-accounts-model-provider");
const knex = require("../../../config/knex");
const RepositoryHelper = require("../../common/repository/repository-helper");
const UsersModelProvider = require("../../users/users-model-provider");
const TABLE_NAME = UosAccountsModelProvider.uosAccountsPropertiesTableName();
const fieldsToNumerical = [
    'id',
    'entity_id',
    'staked_balance',
    'validity',
    'importance',
    'scaled_importance',
    'stake_rate',
    'scaled_stake_rate',
    'social_rate',
    'scaled_social_rate',
    'transfer_rate',
    'scaled_transfer_rate',
    'previous_cumulative_emission',
    'current_emission',
    'current_cumulative_emission',
];
class UosAccountsPropertiesRepository {
    static async findAll() {
        const data = await knex(TABLE_NAME);
        RepositoryHelper.convertStringFieldsToNumbersForArray(data, fieldsToNumerical, ['id', 'entity_id']);
        return data;
    }
    static async findManyForEntityEvents(limit, lastId = null) {
        const queryBuilder = knex(TABLE_NAME)
            .where({
            entity_name: UsersModelProvider.getEntityName(),
        })
            .orderBy('id', 'ASC')
            .limit(limit);
        if (lastId) {
            // noinspection JSIgnoredPromiseFromCall
            queryBuilder.whereRaw(`id > ${+lastId}`);
        }
        const data = await queryBuilder;
        RepositoryHelper.convertStringFieldsToNumbersForArray(data, fieldsToNumerical, ['id', 'entity_id']);
        return data;
    }
}
module.exports = UosAccountsPropertiesRepository;
