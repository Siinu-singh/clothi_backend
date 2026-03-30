import { Schema, model, Types } from 'mongoose';

export interface INotificationPreferences {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  orderEmails: boolean;
  reviewEmails: boolean;
  wishlistEmails: boolean;
  promotionEmails: boolean;
  newsletterEmails: boolean;
  securityEmails: boolean;
  emailFrequency: 'instant' | 'daily' | 'weekly' | 'never';
  createdAt?: Date;
  updatedAt?: Date;
}

const notificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    orderEmails: {
      type: Boolean,
      default: true,
    },
    reviewEmails: {
      type: Boolean,
      default: true,
    },
    wishlistEmails: {
      type: Boolean,
      default: true,
    },
    promotionEmails: {
      type: Boolean,
      default: true,
    },
    newsletterEmails: {
      type: Boolean,
      default: true,
    },
    securityEmails: {
      type: Boolean,
      default: true,
    },
    emailFrequency: {
      type: String,
      enum: {
        values: ['instant', 'daily', 'weekly', 'never'],
        message: 'Invalid email frequency',
      },
      default: 'instant',
    },
  },
  {
    timestamps: true,
    collection: 'notification_preferences',
  }
);

export const NotificationPreferences = model<INotificationPreferences>(
  'NotificationPreferences',
  notificationPreferencesSchema
);
