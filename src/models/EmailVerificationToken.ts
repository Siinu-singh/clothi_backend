import { Schema, model } from 'mongoose';
import { Types } from 'mongoose';

interface IEmailVerificationToken {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const emailVerificationTokenSchema = new Schema<IEmailVerificationToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete expired tokens
    },
  },
  {
    timestamps: true,
    collection: 'email_verification_tokens',
  }
);

export const EmailVerificationToken = model<IEmailVerificationToken>(
  'EmailVerificationToken',
  emailVerificationTokenSchema
);
