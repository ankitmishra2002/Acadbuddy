import express from 'express';
import multer from 'multer';
import {
  listCommunityPosts,
  getCommunityPost,
  createCommunityPost,
  voteCommunityPost,
  commentOnPost,
  getPostComments,
  cloneCommunityPost,
  reportCommunityPost,
  deleteCommunityPost,
  proxyCommunityPostFile,
} from '../controllers/community.controller.js';
import { authenticateAccessToken } from '../middleware/auth.middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/posts', listCommunityPosts);
router.get('/posts/:id/file', proxyCommunityPostFile);
router.get('/posts/:id', getCommunityPost);
router.post('/posts', authenticateAccessToken, upload.single('file'), createCommunityPost);
router.post('/posts/:id/vote', authenticateAccessToken, voteCommunityPost);
router.post('/posts/:id/comment', authenticateAccessToken, commentOnPost);
router.get('/posts/:id/comments', getPostComments);
router.post('/posts/:id/clone', authenticateAccessToken, cloneCommunityPost);
router.post('/posts/:id/report', authenticateAccessToken, reportCommunityPost);
router.delete('/posts/:id', authenticateAccessToken, deleteCommunityPost);

export default router;

