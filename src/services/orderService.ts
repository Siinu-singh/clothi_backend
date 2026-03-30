import { Order, IOrder, IOrderItem, IShippingAddress } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { User } from '../models/User.js';
import { Coupon } from '../models/Coupon.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { Types } from 'mongoose';

export interface CreateOrderInput {
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod?: string;
  couponCode?: string;
}

export class OrderService {
  /**
   * Create a new order from cart
   */
  async createOrder(userId: string, input: CreateOrderInput): Promise<IOrder> {
    try {
      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Validate product stock
      for (const item of input.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new NotFoundError(`Product ${item.productId} not found`);
        }

        // Check inventory if size/color combination exists
        if (item.size && item.color) {
          const inventoryKey = `${item.size}-${item.color}`;
          const stock = (product.inventory as any)[inventoryKey] || 0;
          if (stock < item.quantity) {
            throw new ConflictError(`Insufficient stock for ${product.title}`);
          }
        }
      }

      // Handle coupon if provided
      let couponId: Types.ObjectId | null = null;
      let couponCode: string | null = null;

      if (input.couponCode) {
        const coupon = await Coupon.findOne({
          code: input.couponCode.toUpperCase(),
          isActive: true,
          expiryDate: { $gte: new Date() },
        });

        if (coupon) {
          couponId = coupon._id;
          couponCode = coupon.code;
          // Track coupon usage
          coupon.usesCount += 1;
          if (!coupon.usedByUsers.find(uid => uid.equals(new Types.ObjectId(userId)))) {
            coupon.usedByUsers.push(new Types.ObjectId(userId));
          }
          await coupon.save();
        }
      }

      // Create order
      const order = new Order({
        userId: new Types.ObjectId(userId),
        items: input.items,
        shippingAddress: input.shippingAddress,
        subtotal: input.subtotal,
        tax: input.tax,
        shippingCost: input.shippingCost,
        discount: input.discount,
        couponId,
        couponCode,
        total: input.total,
        paymentMethod: input.paymentMethod,
      });

      await order.save();

      // Clear user's cart
      await Cart.findOneAndUpdate({ userId }, { items: [], totalPrice: 0, totalItems: 0 });

      return order.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's orders
   */
  async getUserOrders(userId: string, page = 1, limit = 10): Promise<{ orders: IOrder[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.productId', 'title image');

      const total = await Order.countDocuments({ userId });

      return { orders: orders.map(o => o.toObject()), total };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string, userId?: string): Promise<IOrder> {
    try {
      const order = await Order.findById(orderId).populate('items.productId', 'title image description');

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      // Check ownership
      if (userId && order.userId.toString() !== userId) {
        throw new ConflictError('Unauthorized access to this order');
      }

      return order.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<IOrder> {
    try {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

      if (!validStatuses.includes(status)) {
        throw new ConflictError(`Invalid status: ${status}`);
      }

      const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      return order.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: string,
    paymentId?: string
  ): Promise<IOrder> {
    try {
      const validStatuses = ['pending', 'completed', 'failed', 'refunded'];

      if (!validStatuses.includes(paymentStatus)) {
        throw new ConflictError(`Invalid payment status: ${paymentStatus}`);
      }

      const updateData: any = { paymentStatus };
      if (paymentId) {
        updateData.paymentId = paymentId;
      }

      const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      return order.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add tracking number to order
   */
  async addTrackingNumber(orderId: string, trackingNumber: string): Promise<IOrder> {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          trackingNumber,
          status: 'shipped',
        },
        { new: true }
      );

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      return order.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, userId: string): Promise<IOrder> {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      // Check ownership
      if (order.userId.toString() !== userId) {
        throw new ConflictError('Unauthorized to cancel this order');
      }

      // Can only cancel if not shipped or delivered
      if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
        throw new ConflictError(`Cannot cancel order with status: ${order.status}`);
      }

      order.status = 'cancelled';
      await order.save();

      return order.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order by tracking number
   */
  async getOrderByTrackingNumber(trackingNumber: string): Promise<IOrder> {
    try {
      const order = await Order.findOne({ trackingNumber }).populate('items.productId');

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      return order.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(
    page = 1,
    limit = 20,
    status?: string,
    paymentStatus?: string
  ): Promise<{ orders: IOrder[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const query: any = {};

      if (status) query.status = status;
      if (paymentStatus) query.paymentStatus = paymentStatus;

      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email')
        .populate('items.productId', 'title image');

      const total = await Order.countDocuments(query);

      return { orders: orders.map(o => o.toObject()), total };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order statistics (admin)
   */
  async getOrderStatistics(): Promise<any> {
    try {
      const totalOrders = await Order.countDocuments();
      const totalRevenue = await Order.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
          },
        },
      ]);

      const ordersByStatus = await Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const paymentByStatus = await Order.aggregate([
        {
          $group: {
            _id: '$paymentStatus',
            count: { $sum: 1 },
          },
        },
      ]);

      return {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        paymentByStatus,
      };
    } catch (error) {
      throw error;
    }
  }
}

export const orderService = new OrderService();
