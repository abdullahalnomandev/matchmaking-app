import { WebinarLike } from './webinar-like.model';

const toggleCommentLike = async (payload: {
  comment: string;
  user: string;
}) => {
  // Check if user already liked this comment
  const existingLike = await WebinarLike.findOne({
    comment: payload.comment,
    user: payload.user
  });

  if (existingLike) {
    // Unlike: Remove the like
    await WebinarLike.findOneAndDelete({
      comment: payload.comment,
      user: payload.user
    });

    return { liked: false, message: 'Comment unliked successfully' };
  } else {
    // Like: Add the like
    const newLike = await WebinarLike.create({
      comment: payload.comment,
      user: payload.user
    });

    // Populate user and comment info
    await newLike.populate([
      { path: 'user', select: 'name email image' },
      { path: 'comment', select: 'comment' }
    ]);

    return { liked: true, message: 'Comment liked successfully', like: newLike };
  }
};

export const WebinarLikeService = {
  toggleCommentLike
};
