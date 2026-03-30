import { FastifyRequest, FastifyReply } from 'fastify';
import { cartService } from '../services/cartService.js';
import {
  addToCartSchema,
  updateCartItemSchema,
} from '../utils/validators.js';

export class CartController {
  async getCart(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;

    const cart = await cartService.getCart(userId);

    return reply.code(200).send({
      success: true,
      data: cart,
    });
  }

  async addToCart(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const body = addToCartSchema.parse(request.body);

    const cart = await cartService.addToCart(userId, {
      productId: body.productId,
      quantity: body.quantity,
      size: body.size,
      color: body.color,
    });

    return reply.code(200).send({
      success: true,
      data: cart,
      message: 'Product added to cart',
    });
  }

  async removeFromCart(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { itemId } = request.params as { itemId: string };

    const cart = await cartService.removeFromCart(userId, itemId);

    return reply.code(200).send({
      success: true,
      data: cart,
      message: 'Product removed from cart',
    });
  }

  async updateCartItem(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { itemId } = request.params as { itemId: string };
    const body = updateCartItemSchema.parse(request.body);

    const cart = await cartService.updateCartItem(userId, itemId, body.quantity);

    return reply.code(200).send({
      success: true,
      data: cart,
      message: 'Cart item updated',
    });
  }

  async clearCart(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;

    await cartService.clearCart(userId);

    return reply.code(200).send({
      success: true,
      message: 'Cart cleared',
    });
  }
}

export const cartController = new CartController();
