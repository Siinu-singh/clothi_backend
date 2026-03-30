import { FastifyRequest, FastifyReply } from 'fastify';
import { orderService } from '../services/orderService.js';
import { addressService } from '../services/addressService.js';

export class OrderController {
  /**
   * Create a new order
   */
  async createOrder(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const body = request.body as any;

    try {
      const order = await orderService.createOrder(userId, {
        items: body.items,
        shippingAddress: body.shippingAddress,
        subtotal: body.subtotal,
        tax: body.tax,
        shippingCost: body.shippingCost,
        discount: body.discount || 0,
        total: body.total,
        paymentMethod: body.paymentMethod,
        couponCode: body.couponCode,
      });

      return reply.code(201).send({
        success: true,
        data: { order },
        message: 'Order created successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's orders
   */
  async getUserOrders(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const query = request.query as Record<string, any>;
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    try {
      const { orders, total } = await orderService.getUserOrders(
        userId,
        page,
        limit
      );

      return reply.send({
        success: true,
        data: { orders },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { orderId } = request.params as { orderId: string };

    try {
      const order = await orderService.getOrderById(orderId, userId);

      return reply.send({
        success: true,
        data: { order },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { orderId } = request.params as { orderId: string };

    try {
      const order = await orderService.cancelOrder(orderId, userId);

      return reply.send({
        success: true,
        data: { order },
        message: 'Order cancelled successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Track order by tracking number
   */
  async trackOrder(request: FastifyRequest, reply: FastifyReply) {
    const { trackingNumber } = request.params as { trackingNumber: string };

    try {
      const order = await orderService.getOrderByTrackingNumber(trackingNumber);

      return reply.send({
        success: true,
        data: { order },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as Record<string, any>;
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const status = query.status;
    const paymentStatus = query.paymentStatus;

    try {
      const { orders, total } = await orderService.getAllOrders(
        page,
        limit,
        status,
        paymentStatus
      );

      return reply.send({
        success: true,
        data: { orders },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update order status (admin)
   */
  async updateOrderStatus(request: FastifyRequest, reply: FastifyReply) {
    const { orderId } = request.params as { orderId: string };
    const { status } = request.body as { status: string };

    try {
      const order = await orderService.updateOrderStatus(orderId, status);

      return reply.send({
        success: true,
        data: { order },
        message: 'Order status updated successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add tracking number (admin)
   */
  async addTrackingNumber(request: FastifyRequest, reply: FastifyReply) {
    const { orderId } = request.params as { orderId: string };
    const { trackingNumber } = request.body as { trackingNumber: string };

    try {
      const order = await orderService.addTrackingNumber(orderId, trackingNumber);

      return reply.send({
        success: true,
        data: { order },
        message: 'Tracking number added successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order statistics (admin)
   */
  async getOrderStatistics(request: FastifyRequest, reply: FastifyReply) {
    try {
      const statistics = await orderService.getOrderStatistics();

      return reply.send({
        success: true,
        data: { statistics },
      });
    } catch (error) {
      throw error;
    }
  }
}

export const orderController = new OrderController();
