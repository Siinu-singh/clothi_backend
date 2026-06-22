import { Schema, model, Types } from 'mongoose';

export interface IAnnouncement {
  _id?: Types.ObjectId;
  text: string;
  link?: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    text: {
      type: String,
      required: [true, 'Announcement text is required'],
      trim: true,
      maxlength: [300, 'Announcement text cannot exceed 300 characters'],
    },
    link: {
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'announcements',
  }
);

// Indexes
announcementSchema.index({ isActive: 1, order: 1 });
announcementSchema.index({ createdAt: -1 });

export const Announcement = model<IAnnouncement>('Announcement', announcementSchema);
