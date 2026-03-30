import { Favorite } from '../models/Favorite.js';
import { Product } from '../models/Product.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { IFavorite } from '../types/index.js';
import { Types } from 'mongoose';

export class FavoriteService {
  async getFavorites(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const favorites = await Favorite.find({ userId })
      .populate({
        path: 'productId',
        select: 'title price image badge',
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Favorite.countDocuments({ userId });
    const pages = Math.ceil(total / limit);

    return {
      favorites,
      pagination: { total, page, limit, pages },
    };
  }

  async addToFavorites(userId: string, productId: string): Promise<IFavorite> {
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product');
    }

    // Check if already in favorites
    const existing = await Favorite.findOne({ userId, productId });
    if (existing) {
      throw new ConflictError('Product is already in favorites');
    }

    // Add to favorites
    const favorite = new Favorite({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });

    await favorite.save();
    return favorite.toObject();
  }

  async removeFromFavorites(userId: string, productId: string): Promise<void> {
    const result = await Favorite.findOneAndDelete({ userId, productId });

    if (!result) {
      throw new NotFoundError('Favorite item');
    }
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const favorite = await Favorite.findOne({ userId, productId });
    return !!favorite;
  }

  async getUserFavoriteIds(userId: string): Promise<string[]> {
    const favorites = await Favorite.find({ userId }).select('productId').lean();
    return favorites.map((fav) => fav.productId.toString());
  }

  async removeFavoritesByProductId(productId: string): Promise<void> {
    await Favorite.deleteMany({ productId });
  }
}

export const favoriteService = new FavoriteService();
