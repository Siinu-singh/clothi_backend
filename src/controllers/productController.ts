import { FastifyRequest, FastifyReply } from 'fastify';
import { productService } from '../services/productService.js';
import { productQuerySchema, productSchema } from '../utils/validators.js';

export class ProductController {
  async getAllProducts(request: FastifyRequest, reply: FastifyReply) {
    const query = productQuerySchema.parse(request.query);

    const { products, total, pages } = await productService.getAllProducts(
      query.page,
      query.limit,
      {
        search: query.search,
        category: query.category,
        color: query.color,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      }
    );

    return reply.code(200).send({
      success: true,
      data: {
        products,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          pages,
        },
      },
    });
  }

  async getProductById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    const product = await productService.getProductById(id);

    return reply.code(200).send({
      success: true,
      data: product,
    });
  }

  async searchProducts(request: FastifyRequest, reply: FastifyReply) {
    const { q, page = '1', limit = '20' } = request.query as {
      q: string;
      page?: string;
      limit?: string;
    };

    if (!q) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Search query is required',
      });
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));

    const { products, total, pages } = await productService.searchProducts(
      q,
      pageNum,
      limitNum
    );

    return reply.code(200).send({
      success: true,
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages,
        },
      },
    });
  }

  async getRelatedProducts(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { limit = '4' } = request.query as { limit?: string };

    const limitNum = Math.min(10, Math.max(1, parseInt(limit) || 4));

    const relatedProducts = await productService.getRelatedProducts(id, limitNum);

    return reply.code(200).send({
      success: true,
      data: relatedProducts,
    });
  }

  async createProduct(request: FastifyRequest, reply: FastifyReply) {
    const body = productSchema.parse(request.body);

    const product = await productService.createProduct(body);

    return reply.code(201).send({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  }

  async updateProduct(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = productSchema.partial().parse(request.body);

    const product = await productService.updateProduct(id, body);

    return reply.code(200).send({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  }

  async deleteProduct(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    await productService.deleteProduct(id);

    return reply.code(200).send({
      success: true,
      message: 'Product deleted successfully',
    });
  }
}

export const productController = new ProductController();
