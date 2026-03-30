import { FastifyRequest, FastifyReply } from 'fastify';
import { addressService } from '../services/addressService.js';

export class AddressController {
  /**
   * Create address
   */
  async createAddress(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const body = request.body as any;

    try {
      const address = await addressService.createAddress(userId, {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        street: body.street,
        apartment: body.apartment,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        country: body.country,
        isDefault: body.isDefault || false,
        type: body.type || 'shipping',
      });

      return reply.code(201).send({
        success: true,
        data: { address },
        message: 'Address created successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's addresses
   */
  async getUserAddresses(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;

    try {
      const addresses = await addressService.getUserAddresses(userId);

      return reply.send({
        success: true,
        data: { addresses },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get address by ID
   */
  async getAddressById(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { addressId } = request.params as { addressId: string };

    try {
      const address = await addressService.getAddressById(addressId, userId);

      return reply.send({
        success: true,
        data: { address },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get default address
   */
  async getDefaultAddress(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;

    try {
      const address = await addressService.getDefaultAddress(userId);

      return reply.send({
        success: true,
        data: { address },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update address
   */
  async updateAddress(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { addressId } = request.params as { addressId: string };
    const body = request.body as any;

    try {
      const address = await addressService.updateAddress(addressId, userId, {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        street: body.street,
        apartment: body.apartment,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        country: body.country,
        isDefault: body.isDefault,
        type: body.type,
      });

      return reply.send({
        success: true,
        data: { address },
        message: 'Address updated successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete address
   */
  async deleteAddress(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { addressId } = request.params as { addressId: string };

    try {
      await addressService.deleteAddress(addressId, userId);

      return reply.code(204).send();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Set default address
   */
  async setDefaultAddress(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { addressId } = request.params as { addressId: string };

    try {
      const address = await addressService.setDefaultAddress(addressId, userId);

      return reply.send({
        success: true,
        data: { address },
        message: 'Default address set successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get addresses by type
   */
  async getAddressesByType(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { type } = request.params as { type: 'shipping' | 'billing' };

    try {
      const addresses = await addressService.getAddressesByType(userId, type);

      return reply.send({
        success: true,
        data: { addresses },
      });
    } catch (error) {
      throw error;
    }
  }
}

export const addressController = new AddressController();
