import { Address, IAddress } from '../models/Address.js';
import { NotFoundError } from '../utils/errors.js';
import { Types } from 'mongoose';

export interface CreateAddressInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
  type?: 'shipping' | 'billing' | 'both';
}

export class AddressService {
  /**
   * Create a new address
   */
  async createAddress(userId: string, input: CreateAddressInput): Promise<IAddress> {
    try {
      // If this is default, remove default from other addresses
      if (input.isDefault) {
        await Address.updateMany({ userId }, { isDefault: false });
      }

      const address = new Address({
        userId: new Types.ObjectId(userId),
        ...input,
      });

      await address.save();
      return address.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's addresses
   */
  async getUserAddresses(userId: string): Promise<IAddress[]> {
    try {
      const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
      return addresses.map(a => a.toObject());
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get address by ID
   */
  async getAddressById(addressId: string, userId: string): Promise<IAddress> {
    try {
      const address = await Address.findOne({ _id: addressId, userId });

      if (!address) {
        throw new NotFoundError('Address not found');
      }

      return address.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get default address for user
   */
  async getDefaultAddress(userId: string): Promise<IAddress | null> {
    try {
      const address = await Address.findOne({ userId, isDefault: true });
      return address ? address.toObject() : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update address
   */
  async updateAddress(addressId: string, userId: string, input: Partial<CreateAddressInput>): Promise<IAddress> {
    try {
      // If setting as default, remove default from other addresses
      if (input.isDefault === true) {
        await Address.updateMany(
          { userId, _id: { $ne: addressId } },
          { isDefault: false }
        );
      }

      const address = await Address.findOneAndUpdate(
        { _id: addressId, userId },
        input,
        { new: true }
      );

      if (!address) {
        throw new NotFoundError('Address not found');
      }

      return address.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete address
   */
  async deleteAddress(addressId: string, userId: string): Promise<void> {
    try {
      const address = await Address.findOneAndDelete({ _id: addressId, userId });

      if (!address) {
        throw new NotFoundError('Address not found');
      }

      // If deleted address was default, make the first address default
      if (address.isDefault) {
        const nextAddress = await Address.findOne({ userId });
        if (nextAddress) {
          await Address.updateOne({ _id: nextAddress._id }, { isDefault: true });
        }
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Set default address
   */
  async setDefaultAddress(addressId: string, userId: string): Promise<IAddress> {
    try {
      // Remove default from all addresses
      await Address.updateMany({ userId }, { isDefault: false });

      // Set new default
      const address = await Address.findOneAndUpdate(
        { _id: addressId, userId },
        { isDefault: true },
        { new: true }
      );

      if (!address) {
        throw new NotFoundError('Address not found');
      }

      return address.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get addresses by type (shipping/billing)
   */
  async getAddressesByType(userId: string, type: 'shipping' | 'billing'): Promise<IAddress[]> {
    try {
      const addresses = await Address.find({
        userId,
        type: { $in: [type, 'both'] },
      }).sort({ isDefault: -1 });

      return addresses.map(a => a.toObject());
    } catch (error) {
      throw error;
    }
  }
}

export const addressService = new AddressService();
