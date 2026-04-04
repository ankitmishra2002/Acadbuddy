import express from 'express';
import { authenticateAccessToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/adminAuth.middleware.js';
import User from '../../../../models/User.model.js';
import CommunityPost from '../../../../models/CommunityPost.model.js';
import GeneratedContent from '../../../../models/GeneratedContent.model.js';

const router = express.Router();

// Middleware applied to all admin routes
router.use(authenticateAccessToken, requireAdmin);

/**
 * @desc Get all users with their repository metrics
 *       Public Repo = CommunityPosts
 *       Private Repo = GeneratedContent
 * @route GET /api/admin/users
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
    // Using Promise.all to fetch stats for all users concurrently
    const usersWithStats = await Promise.all(users.map(async (user) => {
      // Get public post count
      const publicRepoCount = await CommunityPost.countDocuments({ userId: user._id });
      // Get private generated content count
      const privateRepoCount = await GeneratedContent.countDocuments({ userId: user._id });
      
      return {
        ...user.toObject(),
        publicRepoCount,
        privateRepoCount
      };
    }));

    res.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: 'Server error fetching user list' });
  }
});

// Create a temp route to upgrade an user to admin easily (can be removed later)
router.post('/upgrade-to-admin', async (req, res) => {
    try {
        const { email } = req.body;
        if(!email) return res.status(400).json({message: 'Email is required'});
        const user = await User.findOne({email});
        if(!user) return res.status(404).json({message: 'User not found'});
        user.role = 'admin';
        await user.save();
        res.json({message: `${email} is now an admin!`});
    } catch(err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * USER MODERATION ROUTES
 */

// Toggle Block User
router.put('/users/:id/block', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) return res.status(404).json({message: 'User not found'});
        if(user.role === 'admin') return res.status(403).json({message: 'Cannot block an admin'});
        
        user.status = user.status === 'blocked' ? 'active' : 'blocked';
        await user.save();
        res.json({ message: `User status changed to ${user.status}`, user });
    } catch(err) {
        res.status(500).json({ message: 'Error blocking user' });
    }
});

// Delete User completely
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) return res.status(404).json({message: 'User not found'});
        if(user.role === 'admin') return res.status(403).json({message: 'Cannot delete an admin'});
        
        // Cascade delete
        await CommunityPost.deleteMany({ userId: user._id });
        await GeneratedContent.deleteMany({ userId: user._id });
        await User.findByIdAndDelete(user._id);
        
        res.json({ message: 'User and all associated content deleted successfully' });
    } catch(err) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

/**
 * POST MODERATION ROUTES
 */

// Get all posts for moderation
router.get('/posts', async (req, res) => {
    try {
        const posts = await CommunityPost.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
        res.json(posts);
    } catch(err) {
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

// Toggle Post Status (Hidden/Active)
router.put('/posts/:id/block', async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.id);
        if(!post) return res.status(404).json({message: 'Post not found'});
        
        post.status = post.status === 'hidden' ? 'active' : 'hidden';
        await post.save();
        res.json({ message: `Post status changed to ${post.status}`, post });
    } catch(err) {
        res.status(500).json({ message: 'Error blocking post' });
    }
});

// Delete Post completely
router.delete('/posts/:id', async (req, res) => {
    try {
        const post = await CommunityPost.findByIdAndDelete(req.params.id);
        if(!post) return res.status(404).json({message: 'Post not found'});
        
        res.json({ message: 'Post deleted successfully' });
    } catch(err) {
        res.status(500).json({ message: 'Error deleting post' });
    }
});

export default router;
