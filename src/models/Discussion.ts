import mongoose, { Schema } from 'mongoose';
import { IDiscussion } from '../types/index.ts';

const discussionSchema = new Schema<IDiscussion>({
  case: {
    type: String,
    required: true,
    ref: 'Case',
    unique: true
  },
  messages: [{
    sender: {
      type: String,
      required: true,
      ref: 'HealthcareWorker'
    },
    senderName: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    }
  }],
  participants: [{
    type: String,
    ref: 'HealthcareWorker'
  }]
}, {
  timestamps: true
});

export default mongoose.model<IDiscussion>('Discussion', discussionSchema);
