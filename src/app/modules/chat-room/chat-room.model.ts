import { Schema, model, Types } from 'mongoose';
import { IChatRoom } from './chat-room.interface';

const chatRoomSchema = new Schema<IChatRoom>(
  {
    name: {
      type: String,
      required: [true, 'Chat room name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
      unique: true
    },
    supportArea: {
      type: String,
      required: [true, 'Support area is required'],
      enum: {
        values: [
          'company_creation_and_structuring',
          'legal_advisory',
          'contract_law',
          'corporate_governance',
          'financial_advisory',
          'accounting_and_tax',
          'm_and_a_partnerships',
          'fundraising_and_investment',
          'hr_and_recruitment',
          'payroll_and_compliance',
          'operations_and_process_optimization',
          'supply_chain_management',
          'it_and_cybersecurity',
          'digital_transformation',
          'ai_and_automation',
          'marketing_and_sales_strategy',
          'branding_and_positioning',
          'international_expansion',
          'risk_management',
          'crisis_management',
          'esg_and_sustainability'
        ],
        message: 'Invalid support area'
      }
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    },
    lastMessage: {
      content: {
        type: String,
        maxlength: [1000, 'Message cannot exceed 1000 characters']
      },
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date
      }
    }
  },
  { timestamps: true }
);


export const ChatRoom = model<IChatRoom>('ChatRoom', chatRoomSchema);
