import { FastifyRequest, FastifyReply } from 'fastify';
import { productService } from '../services/productService.js';
import { productQuerySchema, productSchema, objectIdSchema } from '../utils/validators.js';
import { BadRequestError } from '../utils/errors.js';
import { parse } from 'csv-parse/sync';

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
    try {
      const { id } = request.params as { id: string };
      
      // Validate ID format
      objectIdSchema.parse(id);

      const product = await productService.getProductById(id);

      return reply.code(200).send({
        success: true,
        data: product,
      });
    } catch (error) {
      throw error;
    }
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
    try {
      const { id } = request.params as { id: string };
      const { limit = '4' } = request.query as { limit?: string };

      // Validate ID format
      objectIdSchema.parse(id);

      const limitNum = Math.min(10, Math.max(1, parseInt(limit) || 4));

      const relatedProducts = await productService.getRelatedProducts(id, limitNum);

      return reply.code(200).send({
        success: true,
        data: relatedProducts,
      });
    } catch (error) {
      throw error;
    }
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

  async bulkImportProducts(request: FastifyRequest, reply: FastifyReply) {
    const parts = await (request as any).parts();
    let csvText = '';
    let fileFound = false;

    for await (const part of parts) {
      if (part.type === 'file') {
        fileFound = true;
        const filename = part.filename || '';
        const mimeType = part.mimetype || '';
        const isCsv = filename.toLowerCase().endsWith('.csv') || mimeType.includes('csv');
        if (!isCsv) {
          throw new BadRequestError('Only .csv files are supported');
        }
        const buffers: Buffer[] = [];
        for await (const chunk of part.file) {
          buffers.push(chunk);
        }
        csvText = Buffer.concat(buffers).toString('utf-8');
        break;
      }
    }

    if (!fileFound || !csvText.trim()) {
      throw new BadRequestError('CSV file is required');
    }

    const headerAliases: Record<string, string> = {
      oldprice: 'oldPrice',
      old_price: 'oldPrice',
      sizeguide: 'sizeGuide',
      size_guide: 'sizeGuide',
    };

    const normalizeHeader = (header: string) => header.trim().toLowerCase().replace(/\s+/g, '');
    const mapHeader = (header: string) => headerAliases[normalizeHeader(header)] || normalizeHeader(header);

    let records: Record<string, string>[] = [];
    try {
      records = parse(csvText, {
        columns: (headers: string[]) => headers.map((h) => mapHeader(h)),
        skip_empty_lines: true,
        trim: true,
      });
    } catch (error) {
      throw new BadRequestError('Invalid CSV format');
    }

    if (!records.length) {
      throw new BadRequestError('CSV file has no data rows');
    }

    const requiredHeaders = ['title', 'description', 'price', 'image', 'category', 'colors', 'sizes'];
    const headerSet = new Set(Object.keys(records[0] || {}));
    const missingHeaders = requiredHeaders.filter((h) => !headerSet.has(h));
    if (missingHeaders.length) {
      throw new BadRequestError(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    const errors: string[] = [];
    const items: any[] = [];

    const parseList = (value?: string) => {
      if (!value) return [];
      if (value.includes('|')) return value.split('|').map((s) => s.trim()).filter(Boolean);
      if (value.includes(';')) return value.split(';').map((s) => s.trim()).filter(Boolean);
      return value ? [value.trim()] : [];
    };

    const parseInventory = (value?: string) => {
      if (!value) return undefined;
      const entries = parseList(value);
      const inventory: Record<string, number> = {};
      for (const entry of entries) {
        const [size, qty] = entry.split(':').map((s) => s.trim());
        const qtyNum = Number(qty);
        if (!size || !Number.isFinite(qtyNum)) return null;
        inventory[size] = qtyNum;
      }
      return Object.keys(inventory).length ? inventory : undefined;
    };

    records.forEach((record, index) => {
      const rowNumber = index + 2;
      const price = Number(record.price);
      const oldPrice = record.oldPrice ? Number(record.oldPrice) : undefined;
      const colors = parseList(record.colors);
      const sizes = parseList(record.sizes);
      const badge = record.badge ? record.badge.toLowerCase() : undefined;
      const inventory = parseInventory(record.inventory);

      if (!record.title) errors.push(`Row ${rowNumber}: title is required`);
      if (!record.description || record.description.length < 10) errors.push(`Row ${rowNumber}: description must be at least 10 characters`);
      if (!Number.isFinite(price)) errors.push(`Row ${rowNumber}: price must be a number`);
      if (!record.image) errors.push(`Row ${rowNumber}: image is required`);
      if (!record.category) errors.push(`Row ${rowNumber}: category is required`);
      if (colors.length === 0) errors.push(`Row ${rowNumber}: colors must have at least one value`);
      if (sizes.length === 0) errors.push(`Row ${rowNumber}: sizes must have at least one value`);
      if (record.oldPrice && !Number.isFinite(oldPrice)) errors.push(`Row ${rowNumber}: oldPrice must be a number`);
      if (record.inventory && inventory === null) errors.push(`Row ${rowNumber}: inventory must be like S:10|M:8`);

      const candidate = {
        title: record.title,
        description: record.description,
        price,
        oldPrice: Number.isFinite(oldPrice as number) ? oldPrice : undefined,
        image: record.image,
        images: record.images ? parseList(record.images) : undefined,
        category: record.category,
        badge,
        colors,
        sizes,
        inventory: inventory ?? undefined,
        materials: record.materials || undefined,
        sizeGuide: record.sizeGuide || undefined,
      };

      const parsed = productSchema.safeParse(candidate);
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          const field = issue.path.join('.') || 'field';
          errors.push(`Row ${rowNumber}: ${field} ${issue.message}`);
        });
        return;
      }

      items.push(parsed.data);
    });

    if (errors.length) {
      throw new BadRequestError('CSV validation failed', errors);
    }

    let created = [] as any[];
    let skipped = 0;
    try {
      const result = await productService.createUniqueProductsByTitleCategory(items);
      created = result.created;
      skipped = result.skipped;
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Bulk insert failed');
    }

    return reply.code(201).send({
      success: true,
      data: {
        createdCount: created.length,
        skippedCount: skipped,
        products: created,
      },
      message: 'Products imported successfully',
    });
  }

  async updateProduct(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const body = productSchema.partial().parse(request.body);

      // Validate ID format
      objectIdSchema.parse(id);

      const product = await productService.updateProduct(id, body);

      return reply.code(200).send({
        success: true,
        data: product,
        message: 'Product updated successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      // Validate ID format
      objectIdSchema.parse(id);

      await productService.deleteProduct(id);

      return reply.code(200).send({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      throw error;
    }
  }
}

export const productController = new ProductController();
