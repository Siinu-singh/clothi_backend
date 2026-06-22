import { Announcement, IAnnouncement } from '../models/Announcement.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export interface CreateAnnouncementInput {
  text: string;
  link?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateAnnouncementInput {
  text?: string;
  link?: string | null;
  isActive?: boolean;
  order?: number;
}

export class AnnouncementService {
  /**
   * Get all active announcements (public endpoint)
   */
  async getActiveAnnouncements(): Promise<IAnnouncement[]> {
    const announcements = await Announcement.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
    return announcements as IAnnouncement[];
  }

  /**
   * Get all announcements with pagination (admin)
   */
  async getAllAnnouncements(
    limit = 20,
    page = 1
  ): Promise<{
    announcements: IAnnouncement[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }> {
    const skip = (page - 1) * limit;
    const total = await Announcement.countDocuments();
    const announcements = await Announcement.find()
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      announcements: announcements as IAnnouncement[],
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(id: string): Promise<IAnnouncement> {
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }
    return announcement.toObject();
  }

  /**
   * Create a new announcement (admin)
   */
  async createAnnouncement(input: CreateAnnouncementInput): Promise<IAnnouncement> {
    if (!input.text || input.text.trim().length === 0) {
      throw new ValidationError('Announcement text is required');
    }

    // Auto-assign order if not provided: put it at the end
    if (input.order === undefined || input.order === null) {
      const maxOrderDoc = await Announcement.findOne().sort({ order: -1 }).lean();
      input.order = maxOrderDoc ? (maxOrderDoc as IAnnouncement).order + 1 : 0;
    }

    const announcement = new Announcement({
      text: input.text.trim(),
      link: input.link?.trim() || null,
      isActive: input.isActive !== undefined ? input.isActive : true,
      order: input.order,
    });

    await announcement.save();
    return announcement.toObject();
  }

  /**
   * Update an announcement (admin)
   */
  async updateAnnouncement(
    id: string,
    input: UpdateAnnouncementInput
  ): Promise<IAnnouncement> {
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }

    if (input.text !== undefined) {
      if (input.text.trim().length === 0) {
        throw new ValidationError('Announcement text cannot be empty');
      }
      announcement.text = input.text.trim();
    }
    if (input.link !== undefined) {
      announcement.link = input.link?.trim() || undefined;
    }
    if (input.isActive !== undefined) {
      announcement.isActive = input.isActive;
    }
    if (input.order !== undefined) {
      announcement.order = input.order;
    }

    await announcement.save();
    return announcement.toObject();
  }

  /**
   * Delete an announcement (admin)
   */
  async deleteAnnouncement(id: string): Promise<void> {
    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }
  }
}

export const announcementService = new AnnouncementService();
