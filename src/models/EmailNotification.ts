import { Schema, model, Types } from 'mongoose';

export interface IEmailNotification {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'order' | 'review_approved' | 'wishlist_shared' | 'promotion' | 'newsletter' | 'security';
  subject: string;
  template: string;
  data?: Record<string, any>;
  sent: boolean;
  sentAt?: Date;
  readAt?: Date;
  bounced: boolean;
  bouncedAt?: Date;
  bounceReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const emailNotificationSchema = new Schema<IEmailNotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['order', 'review_approved', 'wishlist_shared', 'promotion', 'newsletter', 'security'],
        message: 'Invalid email notification type',
      },
      required: [true, 'Notification type is required'],
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
    },
    template: {
      type: String,
      required: [true, 'Template name is required'],
    },
    data: {
      type: Map,
      of: Schema.Types.Mixed,
      default: new Map(),
    },
    sent: {
      type: Boolean,
      default: false,
      index: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
    bounced: {
      type: Boolean,
      default: false,
    },
    bouncedAt: {
      type: Date,
      default: null,
    },
    bounceReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'email_notifications',
  }
);

// Indexes for efficient querying
emailNotificationSchema.index({ userId: 1, type: 1 });
emailNotificationSchema.index({ userId: 1, sent: 1 });
emailNotificationSchema.index({ createdAt: -1 });
emailNotificationSchema.index({ sent: 1, bounced: 1 });

export const EmailNotification = model<IEmailNotification>(
  'EmailNotification',
  emailNotificationSchema
);
