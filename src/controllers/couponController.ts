import { FastifyRequest, FastifyReply } from 'fastify';
import { couponService } from '../services/couponService.js';

export class CouponController {
  /**
   * Create coupon (admin)
   */
  async createCoupon(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;

    try {
      const coupon = await couponService.createCoupon({
        code: body.code,
        type: body.type,
        value: body.value,
        maxDiscount: body.maxDiscount,
        minPurchaseAmount: body.minPurchaseAmount,
        maxUses: body.maxUses,
        maxUsesPerUser: body.maxUsesPerUser,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        expiryDate: new Date(body.expiryDate),
        applicableCategories: body.applicableCategories,
        applicableProducts: body.applicableProducts,
        description: body.description,
      });

      return reply.code(201).send({
        success: true,
        data: { coupon },
        message: 'Coupon created successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all coupons (admin)
   */
  async getAllCoupons(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as {
      limit?: string;
      page?: string;
      activeOnly?: string;
    };

    try {
      const limit = query.limit ? parseInt(query.limit) : 10;
      const page = query.page ? parseInt(query.page) : 1;
      const activeOnly = query.activeOnly === 'true';

      const result = await couponService.getAllCoupons(limit, page, activeOnly);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get coupon by ID
   */
  async getCouponById(request: FastifyRequest, reply: FastifyReply) {
    const { couponId } = request.params as { couponId: string };

    try {
      const coupon = await couponService.getCouponById(couponId);

      return reply.send({
        success: true,
        data: { coupon },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate coupon
   */
  async validateCoupon(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const body = request.body as any;

    try {
      const result = await couponService.validateCoupon(
        {
          code: body.code,
          subtotal: body.subtotal,
          cartItems: body.cartItems,
        },
        userId
      );

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update coupon (admin)
   */
  async updateCoupon(request: FastifyRequest, reply: FastifyReply) {
    const { couponId } = request.params as { couponId: string };
    const body = request.body as any;

    try {
      const coupon = await couponService.updateCoupon(couponId, {
        code: body.code,
        type: body.type,
        value: body.value,
        maxDiscount: body.maxDiscount,
        minPurchaseAmount: body.minPurchaseAmount,
        maxUses: body.maxUses,
        maxUsesPerUser: body.maxUsesPerUser,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        isActive: body.isActive,
        applicableCategories: body.applicableCategories,
        applicableProducts: body.applicableProducts,
        description: body.description,
      });

      return reply.send({
        success: true,
        data: { coupon },
        message: 'Coupon updated successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete coupon (admin)
   */
  async deleteCoupon(request: FastifyRequest, reply: FastifyReply) {
    const { couponId } = request.params as { couponId: string };

    try {
      await couponService.deleteCoupon(couponId);

      return reply.code(204).send();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get coupons by product
   */
  async getCouponsByProduct(request: FastifyRequest, reply: FastifyReply) {
    const { productId } = request.params as { productId: string };

    try {
      const coupons = await couponService.getCouponsByProduct(productId);

      return reply.send({
        success: true,
        data: { coupons },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get coupons by category
   */
  async getCouponsByCategory(request: FastifyRequest, reply: FastifyReply) {
    const { category } = request.params as { category: string };

    try {
      const coupons = await couponService.getCouponsByCategory(category);

      return reply.send({
        success: true,
        data: { coupons },
      });
    } catch (error) {
      throw error;
    }
  }
}

export const couponController = new CouponController();
