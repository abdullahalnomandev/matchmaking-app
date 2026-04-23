import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { Message } from '../message/message.model';
import { User } from '../user/user.model';
import { Conversation } from './conversaiton.model';
import { conversaionSearchableField } from './conversation.constant';

const createConversation = async ({
  creator,
  participant,
  text,
}: {
  creator: string;
  participant: string;
  text: string;
}) => {
  if (!text) {
    throw new Error('Please enter a message');
  }
  const [isCreateorExist, isParticipantExist] = await Promise.all([
    User.findById(creator, '_id').lean().exec(),
    User.findById(participant, '_id').lean().exec(),
  ]);

  if (!isCreateorExist) {
    throw new Error('Creator not found');
  }
  if (!isParticipantExist) {
    throw new Error('Participant not found');
  }

  // 1️⃣ Check for existing conversation
  let conversation = await Conversation.findOne({
    $or: [
      { creator, participant },
      { creator: participant, participant: creator },
    ],
  });

  // 2️⃣ If no conversation, create it
  if (!conversation) {
    conversation = await Conversation.create({ creator, participant });
  }

  // 3️⃣ Create the message
  const newMessage = await Message.create({
    conversation: conversation._id,
    sender: creator,
    receiver: participant,
    text: text,
  });

  // 4️⃣ Update lastMessage in conversation
  conversation.lastMessage = newMessage._id;
  await conversation.save();

  const io = (global as any).io;
  io.emit(`new_message::${newMessage.conversation}`, newMessage);
  io.emit(`new_user::${newMessage.receiver}`, newMessage);

  // 5️⃣ Populate lastMessage
  await conversation.populate({
    path: 'lastMessage',
    populate: {
      path: 'sender receiver',
      model: 'User',
      select: '_id name',
    },
  });
  return conversation;
};

// const getAllConversaions = async (query: Record<string, any>, userId: string) => {
//     // The "participant" should always mean "other user", i.e., not my profile.
//     // So, we always want to populate the user who is NOT me.

//     const search = query.searchTerm || "";
//     query.sort = '-updatedAt';

//     const result = new QueryBuilder(
//         Conversation.find({
//             $or: [{ creator: userId }, { participant: userId }],
//         }),
//         query
//     )
//         .search(conversaionSearchableField)
//         .paginate()
//         .sort()
//         .filter();

//     // We always want to populate the "other user" as "participant" (from my POV):
//     let modelQuery = result.modelQuery
//         .populate({
//             path: "creator participant",
//             select: "_id name image", // add more if needed
//             model: "User"
//         })
//         .populate({
//             path: "lastMessage",
//             select: "text -_id",
//         });

//     const data = await modelQuery;
//     const pagination = await result.getPaginationInfo();

//     // Always assign "participant" on result as the user who is not me, so frontend can always consume .participant as the opposite user
//     const mappedData = data.map((conv: any) => {
//         let participantUser;
//         if (conv.creator && conv.creator._id.toString() !== userId) {
//             participantUser = conv.creator;
//         } else if (conv.participant && conv.participant._id.toString() !== userId) {
//             participantUser = conv.participant;
//         } else {
//             participantUser = null; // fallback
//         }
//         // Remove both creator & participant references, only expose participant as opposite person
//         return {
//             ...conv.toObject(),
//             participant: participantUser,
//             creator: undefined
//         }
//     }).filter((conv: any) => conv.participant !== null);

//     return {
//         pagination,
//         data: mappedData,
//     };
// };

const getAllConversaions = async (
  query: Record<string, any>,
  userId: string,
) => {
  const search = query.searchTerm || '';
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const pipeline: any[] = [
    {
      $match: {
        $or: [{ creator: userObjectId }, { participant: userObjectId }],
      },
    },

    // 👇 JOIN USERS
    {
      $lookup: {
        from: 'users',
        localField: 'creator',
        foreignField: '_id',
        as: 'creator',
      },
    },
    { $unwind: '$creator' },
    { $project: { 'creator.password': 0 } }, // remove password

    {
      $lookup: {
        from: 'users',
        localField: 'participant',
        foreignField: '_id',
        as: 'participant',
      },
    },
    { $unwind: '$participant' },
    { $project: { 'participant.password': 0 } }, // remove password

    // 👇 JOIN MESSAGE
    {
      $lookup: {
        from: 'messages',
        localField: 'lastMessage',
        foreignField: '_id',
        as: 'lastMessage',
      },
    },
    {
      $unwind: {
        path: '$lastMessage',
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  // 🔍 SEARCH
  if (search.trim()) {
    pipeline.push({
      $match: {
        $or: [
          { 'creator.name': { $regex: search, $options: 'i' } },
          { 'participant.name': { $regex: search, $options: 'i' } },
          { 'lastMessage.text': { $regex: search, $options: 'i' } },
        ],
      },
    });
  }

  // 📊 SORT
  pipeline.push({ $sort: { updatedAt: -1 } });

  // 📄 PAGINATION
  pipeline.push({
    $facet: {
      data: [{ $skip: skip }, { $limit: limit }],
      totalCount: [{ $count: 'count' }],
    },
  });

  const result = await Conversation.aggregate(pipeline);

  const conversations = result[0]?.data || [];
  const total = result[0]?.totalCount[0]?.count || 0;

  // 🎯 MAP OTHER USER
  const mappedData = conversations.map((conv: any) => {
    const otherUser =
      conv.creator._id.toString() !== userId
        ? {
            _id: conv.participant?._id,
            name: conv.creator.name,
            image: conv.creator.image,
            email: conv.creator.email.split('@')[0],
          }
        : {
            _id: conv.participant?._id,
            name: conv.participant.name,
            image: conv.participant.image,
            email: conv.participant.email.split('@')[0],
          };

    return {
      _id: conv._id,
      participant: otherUser,
      lastMessage: conv.lastMessage ? { text: conv.lastMessage.text } : null,
      updatedAt: conv.updatedAt,
    };
  });

  return {
    pagination: {
      total,
      limit,
      page,
      totalPage: Math.ceil(total / limit),
    },
    data: mappedData,
  };
};

const deleteConversation = async (id: string, creator: string) => {
  const conversation = await Conversation.findById(id);
  if (!conversation) {
    throw new Error('Conversation not found');
  }
  if (conversation.creator.toString() !== creator) {
    throw new Error('You are not authorized to delete this conversation');
  }

  await Message.deleteMany({ conversation: id });
  await conversation.deleteOne();

  return conversation;
};

export const ConversationService = {
  createConversation,
  getAllConversaions,
  deleteConversation,
};
