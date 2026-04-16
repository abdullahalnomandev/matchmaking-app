import QueryBuilder from '../../../builder/QueryBuilder';
import { IWebinarComment } from './webnar.comment';
import { WebinarComment } from './webinar-comment.model';
import { Webinar } from '../webinar.model';
import { WebinarLike } from '../like/webinar-like.model';

const createComment = async (payload: {
  webinar: string;
  comment: string;
  user: string;
}) => {
  const comment = await WebinarComment.create(payload);
  
  // Populate user and webinar info
  await comment.populate([
    { path: 'user', select: 'name email image' },
    { path: 'webinar', select: 'title' }
  ]);

  // Update webinar comment count
  const totalCount = await WebinarComment.countDocuments({
    webinar: payload.webinar
  });
  
  await Webinar.findByIdAndUpdate(
    payload.webinar,
    { commentCount: totalCount },
    { new: true, upsert: false }
  );

  // Emit real-time event
  const io = (global as any).io;
  if (io) {
    io.emit(`webinar_comment::${payload.webinar}`, comment);
    io.emit(`webinar_update::${payload.webinar}`, {
      type: 'comment',
      data: comment
    });
  }

  return comment;
};

const getCommentsByWebinar = async (
  query: Record<string, any>,
  webinarId: string,
  userId: string
) => {
  const commentQuery = new QueryBuilder(
    WebinarComment.find({ webinar: webinarId }),
    query
  )
    .paginate()
    .sort()
    .filter();

  const comments = await commentQuery.modelQuery
    .populate('user', 'name email image')
    .populate('webinar', 'title')
    .lean();

  const commentIds = comments.map(c => c._id);

  // 🔥 Get like counts grouped by comment
  const likeCounts = await WebinarLike.aggregate([
    { $match: { comment: { $in: commentIds } } },
    {
      $group: {
        _id: '$comment',
        count: { $sum: 1 }
      }
    }
  ]);

  // 🔥 Get user liked comments
  const userLikes = await WebinarLike.find({
    comment: { $in: commentIds },
    user: userId
  }).select('comment');

  const likedMap = new Set(userLikes.map(l => l.comment?.toString()).filter(Boolean));

  const likeCountMap = new Map(
    likeCounts.map(l => [l._id.toString(), l.count])
  );

  const data = comments.map(comment => ({
    ...comment,
    likeCount: likeCountMap.get(comment._id.toString()) || 0,
    isLiked: likedMap.has(comment._id.toString())
  }));

  const pagination = await commentQuery.getPaginationInfo();

  const totalCount = await WebinarComment.countDocuments({
    webinar: webinarId
  });

  // Update webinar comment count
  await Webinar.findByIdAndUpdate(
    webinarId,
    { commentCount: totalCount },
    { new: true, upsert: false }
  );

  return {
    data,
    pagination,
    count: totalCount
  };

};

const updateComment = async (
  commentId: string,
  userId: string,
  payload: { comment?: string }
) => {
  const comment = await WebinarComment.findOne({
    _id: commentId,
    user: userId
  });

  if (!comment) {
    throw new Error('Comment not found or you are not authorized to update it');
  }

  if (payload.comment) {
    comment.comment = payload.comment;
  }

  await comment.save();

  // Emit real-time event
  const io = (global as any).io;
  if (io) {
    io.emit(`webinar_comment_update::${comment.webinar}`, comment);
  }

  return comment;
};

const deleteComment = async (commentId: string, userId: string) => {
  const comment = await WebinarComment.findOne({
    _id: commentId,
    user: userId
  });

  if (!comment) {
    throw new Error('Comment not found or you are not authorized to delete it');
  }

  await WebinarComment.findByIdAndDelete(commentId);

  // Update webinar comment count
  const totalCount = await WebinarComment.countDocuments({
    webinar: comment.webinar
  });
  
  await Webinar.findByIdAndUpdate(
    comment.webinar,
    { commentCount: totalCount },
    { new: true, upsert: false }
  );

  // Emit real-time event
  const io = (global as any).io;
  if (io) {
    io.emit(`webinar_comment_delete::${comment.webinar}`, {
      commentId: comment._id,
      webinarId: comment.webinar
    });
  }

  return comment;
};

export const WebinarCommentService = {
  createComment,
  getCommentsByWebinar,
  updateComment,
  deleteComment
};
