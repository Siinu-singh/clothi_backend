import { Coupon, ICoupon } from '../models/Coupon.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { Types } from 'mongoose';

export interface CreateCouponInput {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxDiscount?: number;
  minPurchaseAmount?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  startDate?: Date;
  expiryDate: Date;
  applicableCategories?: string[];
  applicableProducts?: string[];
  description?: string;
}

export interface UpdateCouponInput {
  code?: string;
  type?: 'percentage' | 'fixed';
  value?: number;
  maxDiscount?: number;
  minPurchaseAmount?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  startDate?: Date;
  expiryDate?: Date;
  isActive?: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
  description?: string;
}

export interface ValidateCouponInput {
  code: string;
  subtotal: number;
  cartItems?: { productId: string; category: string }[];
}

export class CouponService {
  /**
   * Create a new coupon
   */
  async createCoupon(input: CreateCouponInput): Promise<ICoupon> {
    try {
      // Check if code already exists
      const existingCoupon = await Coupon.findOne({
        code: input.code.toUpperCase(),
      });

      if (existingCoupon) {
        throw new ValidationError('Coupon code already exists');
      }

      const coupon = new Coupon({
        code: input.code.toUpperCase(),
        type: input.type,
        value: input.value,
        maxDiscount: input.maxDiscount,
        minPurchaseAmount: input.minPurchaseAmount || 0,
        maxUses: input.maxUses,
        maxUsesPerUser: input.maxUsesPerUser || 1,
        startDate: input.startDate || new Date(),
        expiryDate: input.expiryDate,
        applicableCategories: input.applicableCategories || [],
        applicableProducts: input.applicableProducts?.map(
          (id) => new Types.ObjectId(id)
        ) || [],
        description: input.description,
      });

      await coupon.save();
      return coupon.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all coupons
   */
  async getAllCoupons(
    limit = 10,
    page = 1,
    activeOnly = false
  ): Promise<{
    coupons: ICoupon[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }> {
    try {
      const skip = (page - 1) * limit;

      const query: any = {};
      if (activeOnly) {
        query.isActive = true;
        query.expiryDate = { $gt: new Date() };
      }

      const total = await Coupon.countDocuments(query);

      const coupons = await Coupon.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return {
        coupons: coupons as ICoupon[],
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
   * Get coupon by code
   */
  async getCouponByCode(code: string): Promise<ICoupon> {
    try {
      const coupon = await Coupon.findOne({ code: code.toUpperCase() });

      if (!coupon) {
        throw new NotFoundError('Coupon not found');
      }

      return coupon.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get coupon by ID
   */
  async getCouponById(couponId: string): Promise<ICoupon> {
    try {
      const coupon = await Coupon.findById(couponId);

      if (!coupon) {
        throw new NotFoundError('Coupon not found');
      }

      return coupon.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate coupon
   */
  async validateCoupon(
    input: ValidateCouponInput,
    userId?: string
  ): Promise<{
    valid: boolean;
    discount: number;
    message?: string;
    coupon?: ICoupon;
  }> {
    try {
      const coupon = await Coupon.findOne({
        code: input.code.toUpperCase(),
      });

      if (!coupon) {
        return { valid: false, discount: 0, message: 'Coupon not found' };
      }

      // Check if active
      if (!coupon.isActive) {
        return { valid: false, discount: 0, message: 'Coupon is not active' };
      }

      // Check expiry
      if (new Date() > coupon.expiryDate) {
        return { valid: false, discount: 0, message: 'Coupon has expired' };
      }

      // Check start date
      if (new Date() < coupon.startDate) {
        return {
          valid: false,
          discount: 0,
          message: 'Coupon is not yet valid',
        };
      }

      // Check minimum purchase amount
      if (input.subtotal < coupon.minPurchaseAmount) {
        return {
          valid: false,
          discount: 0,
          message: `Minimum purchase of ${coupon.minPurchaseAmount} is required`,
        };
      }

      // Check max uses
      if (coupon.maxUses && coupon.usesCount >= coupon.maxUses) {
        return {
          valid: false,
          discount: 0,
          message: 'Coupon has reached maximum uses',
        };
      }

      // Check max uses per user
      if (userId && coupon.maxUsesPerUser) {
        const userUseCount = coupon.usedByUsers.filter(
          (uid) => uid.toString() === userId
        ).length;

        if (userUseCount >= coupon.maxUsesPerUser) {
          return {
            valid: false,
            discount: 0,
            message: 'You have already used this coupon',
          };
        }
      }

      // Check applicable products/categories
      if (
        input.cartItems &&
        ((coupon.applicableProducts && coupon.applicableProducts.length > 0) ||
          (coupon.applicableCategories && coupon.applicableCategories.length > 0))
      ) {
        const applicableItems = input.cartItems.filter((item) => {
          const matchProduct =
            !coupon.applicableProducts || coupon.applicableProducts.length === 0 ||
            coupon.applicableProducts.some(
              (pid) => pid.toString() === item.productId
            );

          const matchCategory =
            !coupon.applicableCategories || coupon.applicableCategories.length === 0 ||
            coupon.applicableCategories.includes(item.category);

          return matchProduct && matchCategory;
        });

        if (applicableItems.length === 0) {
          return {
            valid: false,
            discount: 0,
            message: 'Coupon is not applicable to items in your cart',
          };
        }
      }

      // Calculate discount
      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = (input.subtotal * coupon.value) / 100;
        if (coupon.maxDiscount) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      } else {
        discount = coupon.value;
      }

      return {
        valid: true,
        discount,
        coupon: coupon.toObject(),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Apply coupon (track usage)
   */
  async applyCoupon(couponId: string, userId?: string): Promise<ICoupon> {
    try {
      const coupon = await Coupon.findById(couponId);

      if (!coupon) {
        throw new NotFoundError('Coupon not found');
      }

      coupon.usesCount += 1;

      if (userId) {
        if (
          !coupon.usedByUsers.some((uid) => uid.toString() === userId)
        ) {
          coupon.usedByUsers.push(new Types.ObjectId(userId));
        }
      }

      await coupon.save();
      return coupon.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update coupon
   */
  async updateCoupon(couponId: string, input: UpdateCouponInput): Promise<ICoupon> {
    try {
      const coupon = await Coupon.findById(couponId);

      if (!coupon) {
        throw new NotFoundError('Coupon not found');
      }

      // Check if code is being changed and if new code exists
      if (input.code && input.code !== coupon.code) {
        const existingCoupon = await Coupon.findOne({
          code: input.code.toUpperCase(),
        });
        if (existingCoupon) {
          throw new ValidationError('Coupon code already exists');
        }
        coupon.code = input.code.toUpperCase();
      }

      if (input.type !== undefined) coupon.type = input.type;
      if (input.value !== undefined) coupon.value = input.value;
      if (input.maxDiscount !== undefined) coupon.maxDiscount = input.maxDiscount;
      if (input.minPurchaseAmount !== undefined)
        coupon.minPurchaseAmount = input.minPurchaseAmount;
      if (input.maxUses !== undefined) coupon.maxUses = input.maxUses;
      if (input.maxUsesPerUser !== undefined)
        coupon.maxUsesPerUser = input.maxUsesPerUser;
      if (input.startDate !== undefined) coupon.startDate = input.startDate;
      if (input.expiryDate !== undefined) coupon.expiryDate = input.expiryDate;
      if (input.isActive !== undefined) coupon.isActive = input.isActive;
      if (input.applicableCategories !== undefined)
        coupon.applicableCategories = input.applicableCategories;
      if (input.applicableProducts !== undefined)
        coupon.applicableProducts = input.applicableProducts.map(
          (id) => new Types.ObjectId(id)
        );
      if (input.description !== undefined) coupon.description = input.description;

      await coupon.save();
      return coupon.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete coupon
   */
  async deleteCoupon(couponId: string): Promise<void> {
    try {
      const coupon = await Coupon.findByIdAndDelete(couponId);

      if (!coupon) {
        throw new NotFoundError('Coupon not found');
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get coupons by product (for displaying available coupons)
   */
  async getCouponsByProduct(productId: string): Promise<ICoupon[]> {
    try {
      const now = new Date();

      const coupons = await Coupon.find({
        $or: [
          { applicableProducts: new Types.ObjectId(productId) },
          { applicableProducts: { $size: 0 } },
        ],
        isActive: true,
        startDate: { $lte: now },
        expiryDate: { $gte: now },
      }).lean();

      return coupons as ICoupon[];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get coupons by category
   */
  async getCouponsByCategory(category: string): Promise<ICoupon[]> {
    try {
      const now = new Date();

      const coupons = await Coupon.find({
        $or: [
          { applicableCategories: category },
          { applicableCategories: { $size: 0 } },
        ],
        isActive: true,
        startDate: { $lte: now },
        expiryDate: { $gte: now },
      }).lean();

      return coupons as ICoupon[];
    } catch (error) {
      throw error;
    }
  }
}

export const couponService = new CouponService();
