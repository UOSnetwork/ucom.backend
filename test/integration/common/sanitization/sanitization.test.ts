import RequestHelper = require('../../helpers/request-helper');
import MockHelper = require('../../helpers/mock-helper');
import SeedsHelper = require('../../helpers/seeds-helper');
import ResponseHelper = require('../../helpers/response-helper');
import PostsRepository = require('../../../../lib/posts/posts-repository');
import PostsHelper = require('../../helpers/posts-helper');
import PostsGenerator = require('../../../generators/posts-generator');
import PostsCurrentParamsRepository = require('../../../../lib/posts/repository/posts-current-params-repository');

const request = require('supertest');

const server = RequestHelper.getApiApplication();

let userVlad;

MockHelper.mockAllBlockchainPart();

const JEST_TIMEOUT = 5000;

// #this test cases should be refactored. Use generators, helper-checkers, etc.
describe('Sanitization', () => {
  beforeAll(async () => {
    await SeedsHelper.noGraphQlMockBlockchainOnly();
  });
  afterAll(async () => {
    await SeedsHelper.afterAllWithoutGraphQl();
  });
  beforeEach(async () => {
    [userVlad] = await SeedsHelper.beforeAllRoutine();
  });

  describe('Media post creation', () => {
    describe('Positive', () => {
      it('Create with ampersand - should be no encoding', async () => {
        const values = {
          title: 'Hello from & <>',
          description: 'Post & harry',
        };

        const postId = await PostsGenerator.createMediaPostByUserHimself(userVlad, values);
        const onePost = await PostsRepository.findOneById(postId);

        expect(onePost.title).toBe(values.title);
        expect(onePost.description).toBe(values.description);
      }, JEST_TIMEOUT);

      it('Post current params row should be created during post creation', async () => {
        const postId = await PostsGenerator.createMediaPostByUserHimself(userVlad);

        const data = await PostsCurrentParamsRepository.getCurrentStatsByEntityId(postId);

        PostsHelper.checkOneNewPostCurrentParams(data, true);
      });
    });
  });

  describe('Sanitizing', () => {
    it('should preserve images', async () => {
      const postId = await PostsGenerator.createMediaPostByUserHimself(userVlad);

      const fieldsToChange = {
        // tslint:disable-next-line
        description: '<div><script>alert("xss");<></script><strike>this is strike</strike><i>extra_text</i><div><a href="https://example.com">test href</a><p>1000 UOS tokens as is.</p><p></p><script>alert(\'123\')</script>2</p><div><figure>\n' +
          '    <img alt="hello" src="https://backend.ucommunity.io/upload/post-image-1537444720877.jpg" />\n' +
          '        \n' +
          '</figure></div><p> </p><p></p><div>\n' +
          '    <ul>\n' +
          '            <li></li>\n' +
          '            <li></li>\n' +
          '    </ul>\n' +
          '</div></div></div>',
      };

      const expected = '<div><strike>this is strike</strike><i>extra_text</i><div><a href="https://example.com">test href</a><p>1000 UOS tokens as is.</p><p></p>2<p></p><div><figure>\n' +
        '    <img alt="hello" src="https://backend.ucommunity.io/upload/post-image-1537444720877.jpg" />\n' +
        '        \n' +
        '</figure></div><p> </p><p></p><div>\n' +
        '    <ul>\n' +
        '            <li></li>\n' +
        '            <li></li>\n' +
        '    </ul>\n' +
        '</div></div></div>';

      const req = request(server)
        .patch(RequestHelper.getOnePostUrl(postId))
        .set('Authorization', `Bearer ${userVlad.token}`)
        .field('description', fieldsToChange.description)
        .field('entity_images', '{}')
        ;

      RequestHelper.addFakeSignedTransactionString(req);

      const res = await req;

      ResponseHelper.expectStatusOk(res);

      const updatedPostId = res.body.post_id;

      const updatedPost = await PostsRepository.findOnlyPostItselfById(updatedPostId);

      expect(updatedPost.description).toBe(expected);
    });

    it('Should preserve iframe and attributes', async () => {
      const postId = await PostsGenerator.createMediaPostByUserHimself(userVlad);

      // noinspection HtmlDeprecatedAttribute
      const fieldsToChange = {
        description:
          `<div class="medium-insert-embeds">
 <figure>
  <div class="medium-insert-embed">
   <div><div style="left:0;width:100%;height:0;position:relative;padding-bottom:56.2493%"><iframe src="https://www.youtube.com/embed/FYNsYz-nOsI?feature=oembed" style="border:0;top:0;left:0;width:100%;height:100%;position:absolute" allowfullscreen scrolling="no"></iframe></div></div>
  </div>
 </figure>

</div><p class="12345">a</p>`,
      };

      const req = request(server)
        .patch(RequestHelper.getOnePostUrl(postId))
        .set('Authorization', `Bearer ${userVlad.token}`)
        .field('description', fieldsToChange.description)
        .field('entity_images', '{}')
        ;

      RequestHelper.addFakeSignedTransactionString(req);

      const res = await req;

      ResponseHelper.expectStatusOk(res);

      const updatedPostId = res.body.post_id;

      const updatedPost = await PostsRepository.findOnlyPostItselfById(updatedPostId);

      expect(updatedPost.description).toBe(fieldsToChange.description);
    });

    it('should sanitize post text fields', async () => {
      const postId = await PostsGenerator.createMediaPostByUserHimself(userVlad);

      const fieldsToChange = {
        title: '<script>alert("hello world!")</script><p>Html content</p> Simple text',
        leading_text: '<script>alert("hello world!")</script><p>Html content</p> Simple text',
        description: '<script>alert("hello world!")</script><p>Html text</p>',
      };

      const req = request(server)
        .patch(RequestHelper.getOnePostUrl(postId))
        .set('Authorization', `Bearer ${userVlad.token}`)
        .field('title', fieldsToChange.title)
        .field('description', fieldsToChange.description)
        .field('leading_text', fieldsToChange.leading_text)
        .field('entity_images', '{}')
        ;

      RequestHelper.addFakeSignedTransactionString(req);

      const res = await req;

      ResponseHelper.expectStatusOk(res);

      const updatedPostId = res.body.post_id;

      const updatedPost = await PostsRepository.findOnlyPostItselfById(updatedPostId);

      expect(updatedPost.title).toBe('Html content Simple text');
      expect(updatedPost.leading_text).toBe('Html content Simple text');
      expect(updatedPost.description).toBe('<p>Html text</p>');
    });
  });
});

export { };
