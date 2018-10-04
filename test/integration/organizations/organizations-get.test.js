const helpers = require('../helpers');
const OrganizationsRepositories = require('../../../lib/organizations/repository');

const models = require('../../../models');
const _ = require('lodash');

let userVlad;
let userJane;
let userPetr;
let userRokky;

describe('Organizations. Get requests', () => {
  beforeAll(async ()  => {
    [userVlad, userJane, userPetr, userRokky] = await helpers.SeedsHelper.beforeAllRoutine();
  });
  afterAll(async ()   => { await helpers.SeedsHelper.sequelizeAfterAll(); });
  beforeEach(async () => {
    await helpers.SeedsHelper.resetOrganizationRelatedSeeds();
  });

  describe('Organization feed', () => {
    it('should get organizations posts for the feed', async () => {
      const org_id = 1;
      const postsResponse = await helpers.Org.requestToGetOrgPosts(org_id);

      const posts = postsResponse.data;

      expect(posts.length).toBe(2);

      posts.forEach(post => {
        expect(post.User).toBeDefined();
        expect(post.organization).toBeDefined();

        expect(post.organization.avatar_filename).toMatch('organizations/');
      });
    });
  });

  describe('Users with organizations data', () => {
    it('should contain organizations list for GET one user by ID', async () => {
      const user_id = userJane.id;

      const model = await helpers.Users.requestToGetUserAsGuest(user_id);
      const organizations = model.organizations;

      expect(organizations).toBeDefined();

      const expectedModels = await OrganizationsRepositories.Main.findAllAvailableForUser(user_id);
      expect(organizations.length).toBe(expectedModels.length);

      organizations.forEach(org => {
        if (org.avatar_filename) {
          expect(org.avatar_filename).toMatch('organizations/');
        }

        delete org.followed_by; // TODO
      });

      expectedModels.forEach(model => {
        expect(organizations.some(org => org.id === model.id)).toBeTruthy();
      });

      helpers.Organizations.checkIncludedOrganizationPreview(model);
    });

    it('should not contain empty organizations array', async () => {
      const model = await helpers.Users.requestToGetUserAsGuest(userRokky.id);

      expect(model.organizations).toBeDefined();
      expect(model.organizations.length).toBe(0);
    });
  });

  describe('Posts with organizations data', () => {
    describe('Single post organization data', () => {
      it('should contain organization data', async () => {
        const post_id = 1;

        const post = await helpers.Post.requestToGetOnePostAsGuest(post_id);
        expect(post.organization_id).toBe(1);

        delete post.organization.followed_by;

        helpers.Org.checkOneOrganizationPreviewFields(post.organization);
      });
    });
  });

  describe('Organization lists', () => {
    it('Get organization lists without query string', async () => {
      const totalCount = await OrganizationsRepositories.Main.countAllOrganizations();
      const organizations = await helpers.Organizations.requestToGetOrganizationsAsGuest();

      expect(organizations).toBeDefined();
      expect(organizations instanceof Array).toBeTruthy();
      expect(organizations.length).toBe(totalCount);

      organizations.forEach(org => {
        delete org.followed_by; // TODO
      });

      helpers.Organizations.checkOrganizationsPreviewFields(organizations);
    });
  });

  describe('One organization', () => {
    it('Get one organization by ID as guest', async () => {
      const model_id = 1;

      await helpers.Org.createSocialNetworksDirectly(model_id);

      const model = await helpers.Organizations.requestToGetOneOrganizationAsGuest(model_id);

      expect(model).toBeDefined();
      expect(model.id).toBe(model_id);

      helpers.UserHelper.checkIncludedUserPreview(model);

      expect(model.users_team).toBeDefined();
      expect(model.users_team.length).toBeGreaterThan(0);

      expect(model.avatar_filename).toMatch('organizations/');
      expect(model.social_networks).toBeDefined();

      expect(model.current_rate).toBeDefined();
      expect(model.current_rate).not.toBeNull();
    });

    it('should return communities and partnerships', async () => {
      const org_id = 1;

      await helpers.Org.createSampleSourcesForOrganization(org_id);

      const model = await helpers.Organizations.requestToGetOneOrganizationAsGuest(org_id);

      const communitySources = model.community_sources;

      expect(_.isArray(communitySources)).toBeTruthy();
      expect(communitySources.length).toBe(6);

      communitySources.forEach(source => {
        expect(source.source_type).toBeDefined();
        if (source.source_type === 'external') {
          expect(source.avatar_filename).toBeDefined();

          if (source.avatar_filename !== null) {
            expect(source.avatar_filename).toMatch('organizations/');
          }
        }
      });

      expect(_.isArray(model.partnership_sources)).toBeTruthy();
      expect(model.partnership_sources.length).toBe(6);

      expect(_.isArray(model.social_networks)).toBeTruthy();
      expect(model.social_networks.length).toBe(0);



      // TODO check response structure based on field external internal
    });

    it('should not contain myself data if requesting as guest', async () => {
      const model_id = 1;

      const model = await helpers.Organizations.requestToGetOneOrganizationAsGuest(model_id);
      expect(model.myselfData).not.toBeDefined();
    });

    it('should contain myselfData if requesting with token', async () => {
      const model_id = 1;

      const model = await helpers.Organizations.requestToGetOneOrganizationAsMyself(userVlad, model_id);
      const myselfData = model.myselfData;

      expect(myselfData).toBeDefined();

      expect(myselfData.follow).toBeDefined();
      expect(myselfData.editable).toBeDefined();
      expect(myselfData.member).toBeDefined();
    });

    it('should contain myselfData editable false if request not from author', async () => {
      const model_id = await OrganizationsRepositories.Main.findLastIdByAuthor(userVlad.id);
      const model = await helpers.Organizations.requestToGetOneOrganizationAsMyself(userJane, model_id);

      expect(model.myselfData.editable).toBeFalsy();
      expect(model.myselfData.member).toBeFalsy();
    });

    it('should contain myselfData editable true and member true if author request his organization', async () => {
      const user = userVlad;

      const model_id = await OrganizationsRepositories.Main.findLastIdByAuthor(user.id);
      const model = await helpers.Organizations.requestToGetOneOrganizationAsMyself(user, model_id);

      expect(model.myselfData.editable).toBeTruthy();
      expect(model.myselfData.member).toBeTruthy();
    });
  });
});