import { NewsletterSubscription } from '../models/Newsletter.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { INewsletterSubscription } from '../types/index.js';

export class NewsletterService {
  async subscribe(email: string): Promise<INewsletterSubscription> {
    // Check if already subscribed
    const existing = await NewsletterSubscription.findOne({ email: email.toLowerCase() });

    if (existing && existing.isSubscribed) {
      throw new ConflictError('Email is already subscribed to the newsletter');
    }

    if (existing && !existing.isSubscribed) {
      // Reactivate subscription
      existing.isSubscribed = true;
      existing.subscribedAt = new Date();
      existing.unsubscribedAt = undefined;
      await existing.save();
      return existing.toObject();
    }

    // Create new subscription
    const subscription = new NewsletterSubscription({
      email: email.toLowerCase(),
      isSubscribed: true,
      subscribedAt: new Date(),
    });

    await subscription.save();
    return subscription.toObject();
  }

  async unsubscribe(email: string): Promise<void> {
    const subscription = await NewsletterSubscription.findOne({
      email: email.toLowerCase(),
    });

    if (!subscription) {
      throw new NotFoundError('Subscription');
    }

    subscription.isSubscribed = false;
    subscription.unsubscribedAt = new Date();
    await subscription.save();
  }

  async isSubscribed(email: string): Promise<boolean> {
    const subscription = await NewsletterSubscription.findOne({
      email: email.toLowerCase(),
    });

    return subscription ? subscription.isSubscribed : false;
  }

  async getSubscribers(page: number = 1, limit: number = 50): Promise<{
    subscribers: INewsletterSubscription[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }> {
    const skip = (page - 1) * limit;

    const subscribers = await NewsletterSubscription.find({ isSubscribed: true })
      .skip(skip)
      .limit(limit)
      .sort({ subscribedAt: -1 })
      .lean();

    const total = await NewsletterSubscription.countDocuments({ isSubscribed: true });
    const pages = Math.ceil(total / limit);

    return {
      subscribers,
      pagination: { total, page, limit, pages },
    };
  }

  async getAllSubscribers(): Promise<string[]> {
    const subscribers = await NewsletterSubscription.find({ isSubscribed: true })
      .select('email')
      .lean();

    return subscribers.map((sub) => sub.email);
  }

  async getSubscriberCount(): Promise<number> {
    return NewsletterSubscription.countDocuments({ isSubscribed: true });
  }

  async deleteSubscription(email: string): Promise<void> {
    const result = await NewsletterSubscription.findOneAndDelete({
      email: email.toLowerCase(),
    });

    if (!result) {
      throw new NotFoundError('Subscription');
    }
  }
}

export const newsletterService = new NewsletterService();
