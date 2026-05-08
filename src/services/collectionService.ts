import { Collection } from '../models/Collection.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { ICollection } from '../types/index.js';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config/constants.js';

export class CollectionService {
  /**
   * Calculate final price based on discount
   */
  private calculateFinalPrice(
    basePrice: number,
    discountType?: string,
    discountValue?: number
  ): number {
    if (!discountType || !discountValue) {
      return basePrice;
    }

    if (discountType === 'percentage') {
      return basePrice - (basePrice * discountValue) / 100;
    } else if (discountType === 'fixed') {
      return Math.max(0, basePrice - discountValue);
    }

    return basePrice;
  }

  /**
   * Validate discount dates
   */
  private validateDiscountDates(startDate?: Date, endDate?: Date): void {
    if (startDate && endDate && startDate >= endDate) {
      throw new BadRequestError('Discount end date must be after start date');
    }
  }

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Check if discount is currently active
   */
  private isDiscountActive(startDate?: Date, endDate?: Date): boolean {
    const now = new Date();
    if (!startDate || !endDate) return false;
    return now >= startDate && now <= endDate;
  }

  /**
   * Get all collections (active only)
   */
  async getAllCollections(
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE,
    filters?: {
      search?: string;
      category?: string;
      tags?: string;
      minPrice?: number;
      maxPrice?: number;
      isFeatured?: boolean;
      sortBy?: 'price' | 'newest' | 'popular' | 'stock';
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{ collections: ICollection[]; total: number; pages: number }> {
    limit = Math.min(limit, MAX_PAGE_SIZE);

    const query: any = { isActive: true };

    // Search
    if (filters?.search) {
      query.$text = { $search: filters.search };
    }

    // Category filter
    if (filters?.category) {
      query.category = filters.category;
    }

    // Tags filter
    if (filters?.tags) {
      const tagsArray = filters.tags.split(',').map((tag) => tag.trim());
      query.tags = { $in: tagsArray };
    }

    // Price range filter
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      query.finalPrice = {};
      if (filters?.minPrice !== undefined) query.finalPrice.$gte = filters.minPrice;
      if (filters?.maxPrice !== undefined) query.finalPrice.$lte = filters.maxPrice;
    }

    // Featured filter
    if (filters?.isFeatured === true) {
      query.isFeatured = true;
    }

    // Sorting
    let sortQuery: any = {};
    if (filters?.sortBy === 'price') {
      sortQuery.finalPrice = filters.sortOrder === 'asc' ? 1 : -1;
    } else if (filters?.sortBy === 'newest') {
      sortQuery.createdAt = -1;
    } else if (filters?.sortBy === 'stock') {
      sortQuery.availableStock = filters.sortOrder === 'asc' ? 1 : -1;
    } else {
      sortQuery.createdAt = -1;
    }

    // Execute query
    const skip = (page - 1) * limit;
    const collections = await Collection.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Collection.countDocuments(query);
    const pages = Math.ceil(total / limit);

    return { collections, total, pages };
  }

  /**
   * Get featured collections
   */
  async getFeaturedCollections(limit: number = 10): Promise<ICollection[]> {
    const collections = await Collection.find({ isActive: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return collections;
  }

  /**
   * Get collection by slug
   */
  async getCollectionBySlug(slug: string): Promise<ICollection> {
    const collection = await Collection.findOne({ slug, isActive: true });

    if (!collection) {
      throw new NotFoundError('Collection');
    }

    return collection.toObject();
  }

  /**
   * Search collections
   */
  async searchCollections(
    query: string,
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE
  ): Promise<{ collections: ICollection[]; total: number; pages: number }> {
    limit = Math.min(limit, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const collections = await Collection.find(
      { $text: { $search: query }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Collection.countDocuments({ $text: { $search: query }, isActive: true });
    const pages = Math.ceil(total / limit);

    return { collections, total, pages };
  }

  /**
   * Get collections by category
   */
  async getByCategory(
    category: string,
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE
  ): Promise<{ collections: ICollection[]; total: number; pages: number }> {
    limit = Math.min(limit, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const collections = await Collection.find({ category, isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Collection.countDocuments({ category, isActive: true });
    const pages = Math.ceil(total / limit);

    return { collections, total, pages };
  }

  /**
   * Get collections by tags
   */
  async getByTags(
    tags: string[],
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE
  ): Promise<{ collections: ICollection[]; total: number; pages: number }> {
    limit = Math.min(limit, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const collections = await Collection.find({ tags: { $in: tags }, isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Collection.countDocuments({ tags: { $in: tags }, isActive: true });
    const pages = Math.ceil(total / limit);

    return { collections, total, pages };
  }

  /**
   * Create collection (admin)
   */
  async createCollection(data: Partial<ICollection>, userId: string): Promise<ICollection> {
    // Generate slug if not provided
    const slug = data.slug || this.generateSlug(data.name || '');

    // Check if slug already exists
    const existingSlug = await Collection.findOne({ slug });
    if (existingSlug) {
      throw new BadRequestError('Collection slug already exists');
    }

    // Validate discount dates
    if (data.discountStartDate || data.discountEndDate) {
      this.validateDiscountDates(data.discountStartDate, data.discountEndDate);
    }

    // Calculate final price
    const finalPrice = this.calculateFinalPrice(
      data.basePrice!,
      data.discountType as string | undefined,
      data.discountValue
    );

    const collection = new Collection({
      ...data,
      slug,
      finalPrice,
      createdBy: userId,
    });

    await collection.save();
    return collection.toObject();
  }

  /**
   * Update collection (admin)
   */
  async updateCollection(
    collectionId: string,
    updates: Partial<ICollection>
  ): Promise<ICollection> {
    // Check if slug is being updated and is already taken
    if (updates.slug) {
      const existing = await Collection.findOne({ slug: updates.slug, _id: { $ne: collectionId } });
      if (existing) {
        throw new BadRequestError('Collection slug already exists');
      }
    }

    // Validate discount dates if being updated
    if (updates.discountStartDate || updates.discountEndDate) {
      this.validateDiscountDates(updates.discountStartDate, updates.discountEndDate);
    }

    // Recalculate final price if base price or discount changed
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      throw new NotFoundError('Collection');
    }

    if (updates.basePrice || updates.discountType || updates.discountValue) {
      const basePrice = updates.basePrice ?? collection.basePrice;
      const discountType = updates.discountType ?? collection.discountType;
      const discountValue = updates.discountValue ?? collection.discountValue;

      updates.finalPrice = this.calculateFinalPrice(
        basePrice,
        discountType as string | undefined,
        discountValue
      );
    }

    const updated = await Collection.findByIdAndUpdate(collectionId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new NotFoundError('Collection');
    }

    return updated.toObject();
  }

  /**
   * Delete collection (admin)
   */
  async deleteCollection(collectionId: string): Promise<void> {
    const result = await Collection.findByIdAndDelete(collectionId);

    if (!result) {
      throw new NotFoundError('Collection');
    }
  }

  /**
   * Toggle featured status
   */
  async toggleFeatured(collectionId: string): Promise<ICollection> {
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      throw new NotFoundError('Collection');
    }

    collection.isFeatured = !collection.isFeatured;
    await collection.save();

    return collection.toObject();
  }

  /**
   * Toggle active status
   */
  async toggleActive(collectionId: string): Promise<ICollection> {
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      throw new NotFoundError('Collection');
    }

    collection.isActive = !collection.isActive;
    await collection.save();

    return collection.toObject();
  }

  /**
   * Update inventory
   */
  async updateInventory(collectionId: string, quantity: number): Promise<ICollection> {
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      throw new NotFoundError('Collection');
    }

    const newAvailable = Math.max(0, collection.availableStock + quantity);

    if (newAvailable > collection.totalStock) {
      throw new BadRequestError('Available stock cannot exceed total stock');
    }

    collection.availableStock = newAvailable;
    await collection.save();

    return collection.toObject();
  }

  /**
   * Get low stock items for admin
   */
  async getLowStockItems(): Promise<ICollection[]> {
    const collections = await Collection.find(
      {
        $expr: { $lte: ['$availableStock', '$lowStockThreshold'] },
        isActive: true,
      },
      'name slug availableStock lowStockThreshold category'
    )
      .sort({ availableStock: 1 })
      .lean();

    return collections;
  }

  /**
   * Get collection stats for admin
   */
  async getCollectionStats(): Promise<{
    totalCollections: number;
    activeCollections: number;
    featuredCollections: number;
    lowStockCollections: number;
    totalInventoryValue: number;
  }> {
    const [totalCollections, activeCollections, featuredCollections, lowStockCollections] =
      await Promise.all([
        Collection.countDocuments({}),
        Collection.countDocuments({ isActive: true }),
        Collection.countDocuments({ isFeatured: true }),
        Collection.countDocuments({
          $expr: { $lte: ['$availableStock', '$lowStockThreshold'] },
        }),
      ]);

    const collections = await Collection.find({}, 'basePrice availableStock').lean();
    const totalInventoryValue = collections.reduce(
      (sum, col) => sum + (col.basePrice * col.availableStock || 0),
      0
    );

    return {
      totalCollections,
      activeCollections,
      featuredCollections,
      lowStockCollections,
      totalInventoryValue,
    };
  }
}

export const collectionService = new CollectionService();
