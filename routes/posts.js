const express = require('express');
const router = express.Router();
const PostsRepository = require('../lib/posts/posts-repository');
const PostsService = require('../lib/posts/post-service');
const {AppError} = require('../lib/api/errors');
const authTokenMiddleWare = require('../lib/auth/auth-token-middleware');
const { cpUpload } = require('../lib/posts/post-edit-middleware');
const { descriptionParser } = require('../lib/posts/post-description-image-middleware');
const config = require('config');
const PostService = require('../lib/posts/post-service');
const ActivityService = require('../lib/activity/activity-service');

/* Get all posts */
router.get('/', async (req, res) => {
  const posts = await PostService.findAll();

  res.send(posts);
});

/* Get post by ID */
router.get('/:post_id', async (req, res, next) => {
  const postId = parseInt(req.params['post_id']);

  const post = await PostService.findOneById(postId, true);

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  clean(post);

  res.send(post);
});


router.post('/:post_id/upvote', [authTokenMiddleWare], async (req, res) => {

  // TODO receive raw transaction and send it to blockchain
  const postIdTo = parseInt(req.params.post_id);

  if (!postIdTo) {
    return res.status(400).send({
      'errors': {
        'post_id': 'Post ID is not correct. Please provide integer value greater than 0',
      }
    });
  }

  // TODO check does exists only
  const postTo = await PostsRepository.findOneById(postIdTo);

  const userFrom = req['user'];

  if (!postTo) {
    return res.status(404).send({
      'errors': {
        'post_id': `There is post with ID ${postIdTo}`
      }
    });
  }

  // TODO #validation check is upvote already exists
  await ActivityService.userUpvotesPost(userFrom.id, postTo.id);

  // TODO #performance - update fetched post
  const changedPost = await PostService.findOneById(postIdTo, true);

  res.send(changedPost);
});

/* Upload post picture (for description) */
router.post('/image', [descriptionParser], async (req, res) => {
  const filename = req['files']['image'][0].filename;
  const rootUrl = config.get('host')['root_url'];

  res.send({
    'files': [
      {
        "url": `${rootUrl}/upload/${filename}`
      }
    ]
  });
});

/* Create new post */
router.post('/', [authTokenMiddleWare, cpUpload], async (req, res) => {
  const newPost = await PostService.createNewPost(req);

  PostService.processOneAfterQuery(newPost);

  res.send(newPost);
});

router.patch('/:post_id', [authTokenMiddleWare, cpUpload], async (req, res) => {

  const postId = parseInt(req.params['post_id']);
  const userId = req['user'].id;

  if (!postId) {
    res.status(400).send({
      'errors': {
        field: 'post_id',
        message: 'Provided post_id parameter is not a correct integer'
      }
    })
  }

  const post = await PostService.findOneByIdAndAuthor(postId, userId, false);

  if (!post) {
    return res.status(404).send({
      'errors': {
        field: 'post entity',
        message: 'Post is not found'
      }
    })
  }

  // Lets change file
  const files = req['files'];
  if (files && files['main_image_filename'] && files['main_image_filename'][0] && files['main_image_filename'][0].filename) {
    req.body['main_image_filename'] = files['main_image_filename'][0].filename;
  }

  // TODO remove unused files
  // TODO avoid changing fields like rate, userId, etc.

  const parameters = req.body;

  parameters['id'] = post.id;
  parameters['user_id'] = req['user'].id;


  const updatedPost = await post.update(parameters);

  res.send(updatedPost);
});


// TODO #refactor - move to service
function clean(obj) {
  for (const propName in obj) {
    if (!obj.hasOwnProperty(propName)) {
      continue;
    }

    if (obj[propName] === null || obj[propName] === undefined || obj[propName] === 'null') {
      delete obj[propName];
    }
  }
}

module.exports = router;