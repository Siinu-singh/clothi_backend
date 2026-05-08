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
    const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    limit = Math.min(limit, MAX_PAGE_SIZE);

    const query: any = {};

    if (filters?.search) {
      query.$text = { $search: filters.search };
    }

    if (filters?.category) {
      query.category = new RegExp(escapeRegex(filters.category), 'i');
    }

    if (filters?.color) {
      query.colors = filters.color;
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      query.price = {};
      if (filters?.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters?.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    let sortQuery: any = {};
    if (filters?.sortBy === 'price') {
      sortQuery.price = filters.sortOrder === 'asc' ? 1 : -1;
    } else if (filters?.sortBy === 'newest') {
      sortQuery.createdAt = -1;
    } else if (filters?.sortBy === 'popular') {
      sortQuery.createdAt = -1;
    } else {
      sortQuery.createdAt = -1;
    }

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

  async findProductByTitleCategory(title: string, category: string): Promise<IProduct | null> {
    const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const normalizedTitle = (title || '').trim();
    const normalizedCategory = (category || '').trim();

    if (!normalizedTitle || !normalizedCategory) {
      return null;
    }

    const product = await Product.findOne({
      title: new RegExp(`^${escapeRegex(normalizedTitle)}$`, 'i'),
      category: new RegExp(`^${escapeRegex(normalizedCategory)}$`, 'i'),
    }).lean();

    return product ? (product as IProduct) : null;
  }

  async createUniqueProductsByTitleCategory(
    items: Partial<IProduct>[]
  ): Promise<{ created: IProduct[]; skipped: number }> {
    const created: IProduct[] = [];
    let skipped = 0;
    const seenKeys = new Set<string>();

    for (const item of items) {
      const title = (item.title || '').trim();
      const category = (item.category || '').trim();
      const key = `${title.toLowerCase()}::${category.toLowerCase()}`;

      if (!title || !category) {
        skipped++;
        continue;
      }

      if (seenKeys.has(key)) {
        skipped++;
        continue;
      }

      seenKeys.add(key);
      const existing = await this.findProductByTitleCategory(title, category);
      if (existing) {
        skipped++;
        continue;
      }

      const product = new Product(item);
      await product.save();
      created.push(product.toObject());
    }

    return { created, skipped };
  }

  async upsertProductsByTitleCategory(items: Partial<IProduct>[]): Promise<{ created: IProduct[]; updated: IProduct[] }> {
    const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const created: IProduct[] = [];
    const updated: IProduct[] = [];

    for (const item of items) {
      const title = (item.title || '').trim();
      const category = (item.category || '').trim();
      const existing = await Product.findOne({
        title: new RegExp(`^${escapeRegex(title)}$`, 'i'),
        category: new RegExp(`^${escapeRegex(category)}$`, 'i'),
      });

      if (!existing) {
        const product = new Product(item);
        await product.save();
        created.push(product.toObject());
        continue;
      }

      const incomingSizes = Array.isArray(item.sizes) ? item.sizes : [];
      const incomingColors = Array.isArray(item.colors) ? item.colors : [];
      const incomingInventory = item.inventory && typeof item.inventory === 'object' ? item.inventory : null;

      const currentInventoryEntries = existing.inventory instanceof Map
        ? Array.from(existing.inventory.entries())
        : Object.entries(existing.inventory || {});
      const mergedInventory = new Map(currentInventoryEntries as [string, number][]);

      if (incomingInventory) {
        Object.entries(incomingInventory).forEach(([size, qty]) => {
          const current = mergedInventory.get(size) || 0;
          const addQty = Number(qty) || 0;
          mergedInventory.set(size, current + addQty);
        });
      } else if (incomingSizes.length > 0) {
        incomingSizes.forEach((size) => {
          const current = mergedInventory.get(size) || 0;
          mergedInventory.set(size, current + 1);
        });
      }

      const mergedSizes = new Set([...(existing.sizes || []), ...incomingSizes]);
      const mergedColors = new Set([...(existing.colors || []), ...incomingColors]);

      existing.inventory = mergedInventory as any;
      existing.sizes = Array.from(mergedSizes);
      existing.colors = Array.from(mergedColors);
      await existing.save();
      updated.push(existing.toObject());
    }

    return { created, updated };
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
    const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const product = await Product.findById(productId);

    if (!product) {
      throw new NotFoundError('Product');
    }

    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      category: new RegExp(`^${escapeRegex(product.category)}$`, 'i'),
    })
      .limit(limit)
      .lean();

    return relatedProducts;
  }
}

export const productService = new ProductService();
