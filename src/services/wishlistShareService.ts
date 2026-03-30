import { Types } from 'mongoose';
import { WishlistShare } from '../models/WishlistShare.js';
import { Favorite } from '../models/Favorite.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { generateToken } from '../utils/token.js';

class WishlistShareService {
  /**
   * Create a shareable wishlist link
   */
  async createShareLink(userId: string, expiresInDays?: number) {
    try {
      const shareToken = generateToken(32); // Generate 32-character token
      const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      const wishlistShare = await WishlistShare.create({
        userId: new Types.ObjectId(userId),
        shareToken,
        expiresAt,
      });

      // Return share token and link
      const shareLink = `${process.env.FRONTEND_URL}/wishlist/shared/${shareToken}`;

      return {
        shareToken: wishlistShare,
        shareLink,
      };
    } catch (error) {
      if ((error as any).code === 11000) {
        throw new Error('Share link already exists');
      }
      throw error;
    }
  }

  /**
   * Get user's wishlist share links
   */
  async getUserShareLinks(userId: string, limit: number, page: number) {
    try {
      const skip = (page - 1) * limit;

      const [shareLinks, total] = await Promise.all([
        WishlistShare.find({ userId: new Types.ObjectId(userId) })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        WishlistShare.countDocuments({ userId: new Types.ObjectId(userId) }),
      ]);

      return {
        shareLinks: shareLinks.map((link) => ({
          ...link.toObject(),
          shareLink: `${process.env.FRONTEND_URL}/wishlist/shared/${link.shareToken}`,
        })),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get shared wishlist by token (public)
   */
  async getSharedWishlist(shareToken: string, limit: number, page: number) {
    try {
      // Find share link
      const shareLink = await WishlistShare.findOne({
        shareToken,
        isActive: true,
      }).populate('userId');

      if (!shareLink) {
        throw new Error('Share link not found or expired');
      }

      // Check expiration
      if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
        throw new Error('Share link has expired');
      }

      // Increment view count
      shareLink.viewCount += 1;
      await shareLink.save();

      // Get favorites
      const skip = (page - 1) * limit;
      const [favorites, total] = await Promise.all([
        Favorite.find({ userId: shareLink.userId._id })
          .populate('productId')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Favorite.countDocuments({ userId: shareLink.userId._id }),
      ]);

      return {
        owner: {
          id: shareLink.userId._id,
          name: (shareLink.userId as any).name,
        },
        products: favorites.map((fav) => fav.productId),
        viewCount: shareLink.viewCount,
        createdAt: shareLink.createdAt,
        expiresAt: shareLink.expiresAt,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Revoke a share link (disable without deleting)
   */
  async revokeShareLink(shareTokenId: string, userId: string) {
    try {
      const shareLink = await WishlistShare.findById(shareTokenId);

      if (!shareLink) {
        throw new Error('Share link not found');
      }

      if (shareLink.userId.toString() !== userId) {
        throw new Error('Unauthorized');
      }

      shareLink.isActive = false;
      await shareLink.save();

      return shareLink;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a share link permanently
   */
  async deleteShareLink(shareTokenId: string, userId: string) {
    try {
      const shareLink = await WishlistShare.findById(shareTokenId);

      if (!shareLink) {
        throw new Error('Share link not found');
      }

      if (shareLink.userId.toString() !== userId) {
        throw new Error('Unauthorized');
      }

      await WishlistShare.findByIdAndDelete(shareTokenId);
    } catch (error) {
      throw error;
    }
  }
}

export const wishlistShareService = new WishlistShareService();
