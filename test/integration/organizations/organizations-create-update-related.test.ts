import { UserModel } from '../../../lib/users/interfaces/model-interfaces';
import { OrgModelResponse } from '../../../lib/organizations/interfaces/model-interfaces';

import SeedsHelper = require('../helpers/seeds-helper');
import OrganizationsGenerator = require('../../generators/organizations-generator');
import PostsGenerator = require('../../generators/posts-generator');

import OrganizationsHelper = require('../helpers/organizations-helper');
import CommonHelper = require('../helpers/common-helper');

let userVlad: UserModel;

const JEST_TIMEOUT = 5000;

const beforeAfterOptions = {
  isGraphQl: false,
  workersMocking: 'all',
};

describe('Organizations create,update related entities', () => {
  beforeAll(async () => { await SeedsHelper.beforeAllSetting(beforeAfterOptions); });
  afterAll(async () => { await SeedsHelper.doAfterAll(beforeAfterOptions); });
  beforeEach(async () => { [userVlad] = await SeedsHelper.beforeAllRoutine(); });

  describe('Create discussions. #posts', () => {
    describe('Positive', () => {
      it('Should add discussions to existing organizations', async () => {
        const firstOrgId = await OrganizationsGenerator.createOrgWithoutTeam(userVlad);
        const postsIds: number[] = await PostsGenerator.createManyMediaPostsOfOrganization(userVlad, firstOrgId, 3);
        await OrganizationsGenerator.changeDiscussionsState(userVlad, firstOrgId, postsIds);

        // Disturbance
        const secondOrgId = await OrganizationsGenerator.createOrgWithoutTeam(userVlad);
        const secondOrgPostIds: number[] = await PostsGenerator.createManyMediaPostsOfOrganization(userVlad, secondOrgId, 5);
        await OrganizationsGenerator.changeDiscussionsState(userVlad, secondOrgId, secondOrgPostIds);

        const orgModel: OrgModelResponse =
          await OrganizationsHelper.requestToGetOneOrganizationAsGuest(firstOrgId);

        CommonHelper.expectModelsExistence(orgModel.discussions, postsIds);

        const secondOrgModel: OrgModelResponse =
          await OrganizationsHelper.requestToGetOneOrganizationAsGuest(secondOrgId);

        CommonHelper.expectModelsExistence(secondOrgModel.discussions, secondOrgPostIds);
      }, JEST_TIMEOUT);
    });
  });
});

export {};
