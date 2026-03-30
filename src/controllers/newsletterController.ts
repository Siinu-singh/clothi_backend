import { FastifyRequest, FastifyReply } from 'fastify';
import { newsletterService } from '../services/newsletterService.js';
import { newsletterSchema } from '../utils/validators.js';

export class NewsletterController {
  async subscribe(request: FastifyRequest, reply: FastifyReply) {
    const body = newsletterSchema.parse(request.body);

    const subscription = await newsletterService.subscribe(body.email);

    return reply.code(201).send({
      success: true,
      data: subscription,
      message: 'Successfully subscribed to newsletter',
    });
  }

  async unsubscribe(request: FastifyRequest, reply: FastifyReply) {
    const body = newsletterSchema.parse(request.body);

    await newsletterService.unsubscribe(body.email);

    return reply.code(200).send({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
    });
  }

  async checkSubscription(request: FastifyRequest, reply: FastifyReply) {
    const { email } = request.query as { email: string };

    if (!email) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Email is required',
      });
    }

    const isSubscribed = await newsletterService.isSubscribed(email);

    return reply.code(200).send({
      success: true,
      data: { isSubscribed },
    });
  }

  async getSubscribers(request: FastifyRequest, reply: FastifyReply) {
    const { page = '1', limit = '50' } = request.query as {
      page?: string;
      limit?: string;
    };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));

    const { subscribers, pagination } = await newsletterService.getSubscribers(
      pageNum,
      limitNum
    );

    return reply.code(200).send({
      success: true,
      data: {
        subscribers,
        pagination,
      },
    });
  }

  async getSubscriberCount(_request: FastifyRequest, reply: FastifyReply) {
    const count = await newsletterService.getSubscriberCount();

    return reply.code(200).send({
      success: true,
      data: { count },
    });
  }
}

export const newsletterController = new NewsletterController();
