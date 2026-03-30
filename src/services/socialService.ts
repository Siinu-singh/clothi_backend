import { SocialPost } from '../models/SocialPost.js';
import { Product } from '../models/Product.js';
import { NotFoundError } from '../utils/errors.js';
import { ISocialPost } from '../types/index.js';
import { Types } from 'mongoose';

export class SocialService {
  async getSocialPosts(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const posts = await SocialPost.find()
      .populate({
        path: 'linkedProducts',
        select: 'title price image badge stock',
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await SocialPost.countDocuments();
    const pages = Math.ceil(total / limit);

    return {
      posts,
      pagination: { total, page, limit, pages },
    };
  }

  async getSocialPostById(postId: string): Promise<ISocialPost> {
    const post = await SocialPost.findById(postId).populate({
      path: 'linkedProducts',
      select: 'title price image badge stock',
    });

    if (!post) {
      throw new NotFoundError('Social post');
    }

    return post.toObject();
  }

  async createSocialPost(
    data: Omit<ISocialPost, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<ISocialPost> {
    // Validate linked products exist if provided
    if (data.linkedProducts && data.linkedProducts.length > 0) {
      const productIds = data.linkedProducts.map((id) =>
        typeof id === 'string' ? new Types.ObjectId(id) : id
      );
      const products = await Product.find({ _id: { $in: productIds } });

      if (products.length !== productIds.length) {
        throw new NotFoundError('One or more products not found');
      }
    }

    const post = new SocialPost({
      title: data.title,
      description: data.description,
      image: data.image,
      video: data.video,
      linkedProducts: data.linkedProducts || [],
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
      },
    });

    await post.save();
    return post.toObject();
  }

  async updateSocialPost(
    postId: string,
    data: Partial<Omit<ISocialPost, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ISocialPost> {
    const post = await SocialPost.findById(postId);

    if (!post) {
      throw new NotFoundError('Social post');
    }

    // Validate linked products if provided
    if (data.linkedProducts && data.linkedProducts.length > 0) {
      const productIds = data.linkedProducts.map((id) =>
        typeof id === 'string' ? new Types.ObjectId(id) : id
      );
      const products = await Product.find({ _id: { $in: productIds } });

      if (products.length !== productIds.length) {
        throw new NotFoundError('One or more products not found');
      }
    }

    // Update only provided fields
    if (data.title !== undefined) post.title = data.title;
    if (data.description !== undefined) post.description = data.description;
    if (data.image !== undefined) post.image = data.image;
    if (data.video !== undefined) post.video = data.video;
    if (data.linkedProducts !== undefined)
      post.linkedProducts = data.linkedProducts;

    await post.save();
    return post.toObject();
  }

  async deleteSocialPost(postId: string): Promise<void> {
    const result = await SocialPost.findByIdAndDelete(postId);

    if (!result) {
      throw new NotFoundError('Social post');
    }
  }

  async linkProductsToPost(
    postId: string,
    productIds: string[]
  ): Promise<ISocialPost> {
    const post = await SocialPost.findById(postId);

    if (!post) {
      throw new NotFoundError('Social post');
    }

    // Validate all products exist
    const objectIds = productIds.map(
      (id) => new Types.ObjectId(id)
    );
    const products = await Product.find({ _id: { $in: objectIds } });

    if (products.length !== productIds.length) {
      throw new NotFoundError('One or more products not found');
    }

    // Add new products, avoiding duplicates
    post.linkedProducts = [
      ...new Set([...post.linkedProducts, ...objectIds].map((id) => id.toString())),
    ].map((id) => new Types.ObjectId(id));

    await post.save();
    return post.toObject();
  }

  async unlinkProductsFromPost(
    postId: string,
    productIds: string[]
  ): Promise<ISocialPost> {
    const post = await SocialPost.findById(postId);

    if (!post) {
      throw new NotFoundError('Social post');
    }

    const objectIds = productIds.map((id) => new Types.ObjectId(id));

    // Remove specified products
    post.linkedProducts = post.linkedProducts.filter(
      (productId) =>
        !objectIds.some((objId) => objId.equals(productId))
    );

    await post.save();
    return post.toObject();
  }

  async updateEngagement(
    postId: string,
    engagement: { likes?: number; comments?: number; shares?: number }
  ): Promise<ISocialPost> {
    const post = await SocialPost.findById(postId);

    if (!post) {
      throw new NotFoundError('Social post');
    }

    if (!post.engagement) {
      post.engagement = { likes: 0, comments: 0, shares: 0 };
    }

    if (engagement.likes !== undefined) post.engagement.likes = engagement.likes;
    if (engagement.comments !== undefined)
      post.engagement.comments = engagement.comments;
    if (engagement.shares !== undefined) post.engagement.shares = engagement.shares;

    await post.save();
    return post.toObject();
  }
}

export const socialService = new SocialService();
