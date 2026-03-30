import { Product } from '../models/Product.js';
import { NotFoundError } from '../utils/errors.js';
import { IProduct } from '../types/index.js';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config/constants.js';

export class ProductService {
  async getAllProducts(
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE,
    filters?: {
      search?: string;
      category?: string;
      color?: string;
      minPrice?: number;
      maxPrice?: number;
      sortBy?: 'price' | 'newest' | 'popular';
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{ products: IProduct[]; total: number; pages: number }> {
    // Ensure limit doesn't exceed MAX_PAGE_SIZE
    limit = Math.min(limit, MAX_PAGE_SIZE);

    // Build query
    const query: any = {};

    if (filters?.search) {
      query.$text = { $search: filters.search };
    }

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.color) {
      query.colors = filters.color;
    }

    // Price range filter
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      query.price = {};
      if (filters?.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters?.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    // Sorting
    let sortQuery: any = {};
    if (filters?.sortBy === 'price') {
      sortQuery.price = filters.sortOrder === 'asc' ? 1 : -1;
    } else if (filters?.sortBy === 'newest') {
      sortQuery.createdAt = -1;
    } else if (filters?.sortBy === 'popular') {
      // You could add a popularity field here
      sortQuery.createdAt = -1;
    } else {
      sortQuery.createdAt = -1;
    }

    // Execute query
    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);
    const pages = Math.ceil(total / limit);

    return { products, total, pages };
  }

  async getProductById(productId: string): Promise<IProduct> {
    const product = await Product.findById(productId).populate('relatedProducts', '_id title price image');

    if (!product) {
      throw new NotFoundError('Product');
    }

    return product.toObject();
  }

  async searchProducts(
    query: string,
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE
  ): Promise<{ products: IProduct[]; total: number; pages: number }> {
    limit = Math.min(limit, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const products = await Product.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments({ $text: { $search: query } });
    const pages = Math.ceil(total / limit);

    return { products, total, pages };
  }

  async createProduct(data: Partial<IProduct>): Promise<IProduct> {
    const product = new Product(data);
    await product.save();
    return product.toObject();
  }

  async updateProduct(productId: string, updates: Partial<IProduct>): Promise<IProduct> {
    const product = await Product.findByIdAndUpdate(productId, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw new NotFoundError('Product');
    }

    return product.toObject();
  }

  async deleteProduct(productId: string): Promise<void> {
    const result = await Product.findByIdAndDelete(productId);

    if (!result) {
      throw new NotFoundError('Product');
    }
  }

  async getRelatedProducts(productId: string, limit: number = 4): Promise<IProduct[]> {
    const product = await Product.findById(productId);

    if (!product) {
      throw new NotFoundError('Product');
    }

    // Find similar products by category
    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      category: product.category,
    })
      .limit(limit)
      .lean();

    return relatedProducts;
  }
}

export const productService = new ProductService();
