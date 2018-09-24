const helpers = require('../helpers');
const _ = require('lodash');
const OrganizationsRepositories = require('../../../lib/organizations/repository');

const request = require('supertest');
const server = require('../../../app');

let userVlad;
let userJane;
let userPetr;

describe('Organizations. Create-update requests', () => {
  beforeAll(async () => {
    [userVlad, userJane, userPetr] = await helpers.SeedsHelper.beforeAllRoutine();
  });

  afterAll(async () => { await helpers.SeedsHelper.sequelizeAfterAll(); });

  beforeEach(async () => {
    await helpers.SeedsHelper.resetOrganizationRelatedSeeds();
  });

  describe('Create organization', () => {
    describe('Positive scenarios', () => {
      it('Should allow empty fields', async () => {
        const user = userVlad;

        const res = await request(server)
          .post(helpers.RequestHelper.getOrganizationsUrl())
          .set('Authorization', `Bearer ${user.token}`)
          .field('title', 'title')
          .field('nickname', 'nickname')
          .field('personal_website_url', '')
          .field('phone_number', '')
        ;

        helpers.ResponseHelper.expectStatusCreated(res);

        const lastOrg = await OrganizationsRepositories.Main.findLastByAuthor(user.id);

        expect(lastOrg.phone_number).toBe('');
        expect(lastOrg.personal_website_url).toBe('');
      });


      it('should create new organization - simple fields set only', async () => {
        let newModelFields = {
          'title': 'Extremely new org',
          'currency_to_show': 'CPX',
          'powered_by': 'CPX',
          'about': 'Extremely cool new about org',
          'nickname': 'extreme_nick',
          'email': 'extreme_email@gmail.com',
          'phone_number': '+19999999',
          'country': 'USA',
          'city': 'LA',
          'address': 'La alley, 18',
          'personal_website_url': 'https://extreme.com',
          'avatar_filename': helpers.FileToUpload.getSampleFilePathToUpload(),
        };

        const body = await helpers.Organizations.requestToCreateNewOrganization(userPetr, newModelFields);
        const lastModel = await OrganizationsRepositories.Main.findLastByAuthor(userPetr.id);
        expect(lastModel).not.toBeNull();

        expect(body.id).toBe(lastModel.id);
        expect(lastModel.avatar_filename.length).toBeGreaterThan(0);
        delete newModelFields.avatar_filename;

        newModelFields.user_id = userPetr.id;

        helpers.ResponseHelper.expectValuesAreExpected(newModelFields, lastModel);

        await helpers.Organizations.isAvatarImageUploaded(lastModel.avatar_filename);
      });

      it('should be possible to create organization and provide random extra fields', async () => {
        const user = userPetr;

        const sampleFields = helpers.Organizations.getSampleOrganizationsParams();

        const newModelFields = {
          'title'   : sampleFields.title,
          'nickname': sampleFields.nickname,
        };

        const extraFields = {
          'random_field_one': 'random_field_one_value',
          'random_field_two': 'random_field_two_value',
        };

        const res = await request(server)
          .post(helpers.RequestHelper.getOrganizationsUrl())
          .set('Authorization', `Bearer ${user.token}`)
          .field('title', newModelFields.title)
          .field('nickname', newModelFields.nickname)
          .field('random_field_one', extraFields.random_field_one)
          .field('random_field_two', extraFields.random_field_two)
        ;

        const lastModel = await OrganizationsRepositories.Main.findLastByAuthor(userPetr.id);
        expect(lastModel).not.toBeNull();

        helpers.ResponseHelper.expectStatusCreated(res);
        helpers.ResponseHelper.expectValuesAreExpected(newModelFields, lastModel);

        expect(lastModel.random_field_one).not.toBeDefined();
        expect(lastModel.random_field_two).not.toBeDefined();
      });

      it('should be possible to create two organizations with empty emails - no unique error', async () => {
        const countBefore = await OrganizationsRepositories.Main.countAllOrganizations();

        const requestOnePromise = request(server)
          .post(helpers.RequestHelper.getOrganizationsUrl())
          .set('Authorization', `Bearer ${userPetr.token}`)
          .field('title', 'Title12345')
          .field('nickname', '123nickname123')
          .field('email', '')
          .field('currency_to_show', '')
        ;
        const requestTwoPromise = request(server)
          .post(helpers.RequestHelper.getOrganizationsUrl())
          .set('Authorization', `Bearer ${userPetr.token}`)
          .field('title', 'Title1234567')
          .field('nickname', '123nickname123567')
          .field('email', '')
          .field('currency_to_show', '')
        ;

        const [resultOne, resultTwo] = await Promise.all([
          requestOnePromise,
          requestTwoPromise
        ]);

        helpers.ResponseHelper.expectStatusCreated(resultOne);
        helpers.ResponseHelper.expectStatusCreated(resultTwo);

        const countAfter = await OrganizationsRepositories.Main.countAllOrganizations();

        expect(countAfter).toBe(countBefore + 2);
      });

      it('Empty values of unique fields must be written to DB as nulls', async () => {
        const user = userPetr;

        const res = await request(server)
          .post(helpers.RequestHelper.getOrganizationsUrl())
          .set('Authorization', `Bearer ${user.token}`)
          .field('title', 'Title12345')
          .field('nickname', '123nickname123')
          .field('email', '')
          .field('currency_to_show', '')
        ;
        helpers.ResponseHelper.expectStatusCreated(res);

        const lastOrg = await OrganizationsRepositories.Main.findLastByAuthor(user.id);

        expect(lastOrg.id).toBe(res.body.id);
        expect(lastOrg.email).toBeNull();
        expect(lastOrg.currency_to_show).toBe('');

      });

      it('should sanitize user input when creation is in process', async () => {

        const sampleFields = helpers.Organizations.getSampleOrganizationsParams();

        let infectedFields = _.clone(sampleFields);
        const textFields = OrganizationsRepositories.Main.getModelSimpleTextFields();

        const injection = '<script>alert("Hello");</script><img src="https://hacked.url"/>';

        textFields.forEach(field => {
          if (infectedFields[field]) {
            infectedFields[field] += injection;
          }
        });

        await helpers.Organizations.requestToCreateNewOrganization(userPetr, infectedFields);
        const lastModel = await OrganizationsRepositories.Main.findLastByAuthor(userPetr.id);

        delete sampleFields.avatar_filename;

        helpers.ResponseHelper.expectValuesAreExpected(sampleFields, lastModel);
      });
    });

    describe('Negative scenarios', () => {
      it('Not possible to create organization without auth token', async () => {
        const res = await request(server)
          .post(helpers.RequestHelper.getOrganizationsUrl())
          .field('title', 'sample_title')
        ;

        helpers.ResponseHelper.expectStatusUnauthorized(res);
      });

      it('should not be possible to create organization without required fields', async () => {

        const res = await request(server)
          .post(helpers.RequestHelper.getOrganizationsUrl())
          .set('Authorization', `Bearer ${userPetr.token}`)
          .field('email', 'email@google.com')
        ;

        helpers.ResponseHelper.expectStatusBadRequest(res);

        const errors = res.body.errors;

        expect(errors).toBeDefined();

        const titleError = errors.find(error => error.field === 'title');
        expect(titleError).toBeDefined();
        expect(titleError.message).toMatch('required');

        const nicknameError = errors.find(error => error.field === 'nickname');
        expect(nicknameError).toBeDefined();
        expect(nicknameError.message).toMatch('required');
      });

      it('should not be possible to create organization with malformed email or url', async () => {
        const res = await request(server)
          .post(helpers.RequestHelper.getOrganizationsUrl())
          .set('Authorization', `Bearer ${userPetr.token}`)
          .field('title', 'my_own_title')
          .field('nickname', 'my_own_nickname')
          .field('email', 'wrong_email')
          .field('personal_website_url', 'wrong_url')
        ;

        helpers.ResponseHelper.expectStatusBadRequest(res);

        const errors = res.body.errors;

        expect(errors.some(data => data.field === 'email')).toBeTruthy();
        expect(errors.some(data => data.field === 'personal_website_url')).toBeTruthy();
      });

      it('should not be possible to set organization ID directly', async () => {
        // TODO
      });

      it('should not be possible to set user_id directly', async () => {
        // TODO
      });

      it('should throw an error if NOT unique fields is provided', async () => {
        const user = userVlad;

        const existingOrg = await OrganizationsRepositories.Main.findFirstByAuthor(user.id);

        const twoFieldsRes = await request(server)
          .post(helpers.RequestHelper.getOrganizationsUrl())
          .set('Authorization', `Bearer ${user.token}`)
          .field('title', 'somehow new title')
          .field('email', existingOrg.email)
          .field('nickname', existingOrg.nickname)
        ;

        helpers.ResponseHelper.expectStatusBadRequest(twoFieldsRes);

        const errors = twoFieldsRes.body.errors;
        expect(errors).toBeDefined();
        expect(errors.length).toBe(2);

        expect(errors.some(error => error.field === 'nickname')).toBeTruthy();
        expect(errors.some(error => error.field === 'email')).toBeTruthy();

        const oneFieldRes = await request(server)
          .post(helpers.RequestHelper.getOrganizationsUrl())
          .set('Authorization', `Bearer ${user.token}`)
          .field('title', 'somehow new title')
          .field('email', 'unique_email@gmail.com')
          .field('nickname', existingOrg.nickname)
        ;

        helpers.ResponseHelper.expectStatusBadRequest(oneFieldRes);

        const oneFieldErrors = oneFieldRes.body.errors;
        expect(oneFieldErrors).toBeDefined();
        expect(oneFieldErrors.length).toBe(1);

        expect(oneFieldErrors.some(error => error.field === 'nickname')).toBeTruthy();
        expect(oneFieldErrors.some(error => error.field === 'email')).toBeFalsy();

        // If only one duplication then only one error
      });
    });
  });

  describe('Update organization', () => {
    describe('Positive scenarios', () => {
      it('should be possible to update organization', async () => {
        const user = userVlad;
        const orgBefore = await OrganizationsRepositories.Main.findLastByAuthor(user.id);

        const avatarFilenameBefore = orgBefore.avatar_filename;

        let sampleOrganizationFields = helpers.Organizations.getSampleOrganizationsParams();
        sampleOrganizationFields.title = 'New title which is changed';

        await helpers.Organizations.requestToUpdateOrganization(orgBefore.id, user, sampleOrganizationFields);

        const orgAfter = await OrganizationsRepositories.Main.findLastByAuthor(user.id);
        const avatarFilenameAfter = orgAfter.avatar_filename;

        delete sampleOrganizationFields.avatar_filename;

        helpers.ResponseHelper.expectValuesAreExpected(sampleOrganizationFields, orgAfter);

        expect(avatarFilenameAfter).not.toBe(avatarFilenameBefore);
        await helpers.Organizations.isAvatarImageUploaded(avatarFilenameAfter);
      });

      it('should sanitize org updating input', async () => {
        // TODO
      });

      it('should be possible to update organization itself without changing email - no unique error', async () => {
        // TODO
      });

      it('should be possible to update organization with random extra fields', async () => {
        const user = userJane;
        const orgBefore = await OrganizationsRepositories.Main.findLastByAuthor(user.id);
        const org_id = orgBefore.id;

        const fieldsToChange = {
          'title': 'Changed title from extremely to',
          'nickname': 'changed_nickname'
        };

        const extraFields = {
          'random_field_one': 'random_field_one_value',
          'random_field_two': 'random_field_two_value',
        };

        const res = await request(server)
          .patch(helpers.RequestHelper.getOneOrganizationUrl(org_id))
          .set('Authorization', `Bearer ${user.token}`)
          .field('title', fieldsToChange.title)
          .field('nickname', fieldsToChange.nickname)
          .field('random_field_one', extraFields.random_field_one)
          .field('random_field_two', extraFields.random_field_two)
        ;

        helpers.ResponseHelper.expectStatusOk(res);

        const orgAfter = await OrganizationsRepositories.Main.findOneById(org_id);

        helpers.ResponseHelper.expectValuesAreExpected(fieldsToChange, orgAfter);

        expect(orgAfter.random_field_one).not.toBeDefined();
        expect(orgAfter.random_field_two).not.toBeDefined();
      });
    });
    describe('Negative scenarios', () => {
      it ('should not be possible to update org using malformed organization ID', async () => {
        // TODO
      });

      it ('should not be possible to update org using not existed organization ID', async () => {
        // TODO
      });

      it('should not be possible to update org without auth token', async () => {
        const org_id = 1;

        const res = await request(server)
          .patch(helpers.RequestHelper.getOneOrganizationUrl(org_id))
          .field('title',  'Sample title to change')
        ;

        helpers.ResponseHelper.expectStatusUnauthorized(res);
      });
    });
  });
});