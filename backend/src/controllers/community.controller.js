import CommunityPost from '../models/CommunityPost.model.js';
import CommunityVote from '../models/CommunityVote.model.js';
import CommunityComment from '../models/CommunityComment.model.js';
import GeneratedContent from '../models/GeneratedContent.model.js';
import User from '../models/User.model.js';
import pdfParse from 'pdf-parse';

export const listCommunityPosts = async (req, res) => {
  try {
    const { university, branch, semester, subject, topic, type, limit = 20, skip = 0 } =
      req.query;
    const query = { status: 'active' };

    if (university) query['metadata.university'] = university;
    if (branch) query['metadata.branch'] = branch;
    if (semester) query['metadata.semester'] = parseInt(semester, 10);
    if (subject) query['metadata.subject'] = subject;
    if (topic) query['metadata.topic'] = { $regex: topic, $options: 'i' };
    if (type) query.type = type;

    const posts = await CommunityPost.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .skip(parseInt(skip, 10))
      .populate('userId', 'name university branch')
      .select('-content');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCommunityPost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('userId', 'name university branch')
      .populate('contentId');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.viewCount++;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const extractFileContent = async (file) => {
  if (!file) {
    return null;
  }

  try {
    if (file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(file.buffer);
      return pdfData.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/msword') {
      // For DOCX files, we'll return a placeholder message
      // In production, you'd want to use a library like 'mammoth' or 'docx'
      return '[DOCX file content - text extraction not implemented]';
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      file.mimetype === 'application/vnd.ms-powerpoint') {
      // For PPT files
      return '[PPT file content - text extraction not implemented]';
    } else {
      // Try to read as text
      return file.buffer.toString('utf-8');
    }
  } catch (error) {
    console.error('Error extracting file content:', error);
    return null;
  }
};

export const createCommunityPost = async (req, res) => {
  try {
    const { contentId, type, title, content, metadata } = req.body;
    const user = await User.findById(req.userId);

    let postContent = content;
    let postType = type;

    // If file is uploaded, extract content
    if (req.file) {
      const extractedContent = await extractFileContent(req.file);
      if (extractedContent) {
        postContent = extractedContent;
        // Determine type from file if not provided
        if (!postType) {
          if (req.file.mimetype.includes('pdf')) {
            postType = 'notes'; // Default for PDF
          } else if (req.file.mimetype.includes('presentation') || req.file.mimetype.includes('powerpoint')) {
            postType = 'ppt';
          } else if (req.file.mimetype.includes('word') || req.file.mimetype.includes('document')) {
            postType = 'report';
          }
        }
      }
    }

    // Validate required metadata fields
    const metadataObj = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;

    if (!metadataObj?.subject) {
      return res.status(400).json({ message: 'Subject is required' });
    }
    if (!metadataObj?.topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }
    if (!metadataObj?.semester) {
      return res.status(400).json({ message: 'Semester is required' });
    }

    const post = new CommunityPost({
      userId: req.userId,
      contentId: contentId || null,
      type: postType,
      title: title || `Shared ${postType}`,
      content: postContent || content,
      metadata: {
        ...metadataObj,
        university: metadataObj?.university || user.university,
        branch: metadataObj?.branch || user.branch,
        semester: parseInt(metadataObj?.semester || user.semester, 10)
      }
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating community post:', error);
    res.status(500).json({ message: error.message });
  }
};

export const voteCommunityPost = async (req, res) => {
  try {
    const { voteType } = req.body;
    const postId = req.params.id;
    let vote = await CommunityVote.findOne({ userId: req.userId, postId });
    const post = await CommunityPost.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (vote) {
      if (vote.voteType !== voteType) {
        if (vote.voteType === 'upvote') {
          post.upvotes--;
        } else {
          post.downvotes--;
        }
        if (voteType === 'upvote') {
          post.upvotes++;
        } else {
          post.downvotes++;
        }
        vote.voteType = voteType;
        await vote.save();
      }
    } else {
      vote = new CommunityVote({
        userId: req.userId,
        postId,
        voteType
      });
      await vote.save();

      if (voteType === 'upvote') {
        post.upvotes++;
      } else {
        post.downvotes++;
      }
    }

    await post.save();
    res.json({ upvotes: post.upvotes, downvotes: post.downvotes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = new CommunityComment({
      userId: req.userId,
      postId: req.params.id,
      content
    });

    await comment.save();
    await comment.populate('userId', 'name');

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const comments = await CommunityComment.find({ postId: req.params.id })
      .sort({ createdAt: 1 })
      .populate('userId', 'name');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cloneCommunityPost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    let sourceContent;
    if (post.contentId) {
      sourceContent = await GeneratedContent.findById(post.contentId);
    }

    const clonedContent = new GeneratedContent({
      userId: req.userId,
      subjectId: req.body.subjectId,
      type: post.type,
      title: `${post.title} (Cloned)`,
      topic: post.metadata.topic,
      content: sourceContent ? sourceContent.content : post.content,
      metadata: {
        generatedAt: new Date()
      }
    });

    await clonedContent.save();
    res.status(201).json(clonedContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reportCommunityPost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.reportedCount++;
    if (post.reportedCount >= 5) {
      post.status = 'reported';
    }
    await post.save();

    res.json({ message: 'Post reported' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCommunityPost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only allow the post owner to delete
    if (post.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    // Delete associated votes and comments
    await CommunityVote.deleteMany({ postId: req.params.id });
    await CommunityComment.deleteMany({ postId: req.params.id });

    // Delete the post
    await CommunityPost.deleteOne({ _id: req.params.id });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting community post:', error);
    res.status(500).json({ message: error.message });
  }
};

