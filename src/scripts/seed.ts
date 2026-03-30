/**
 * Database Seed Script
 * Run with: npx tsx src/scripts/seed.ts
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Product } from '../models/Product.js';

// Load environment variables
config();

const MONGODB_URI = process.env.MONGODB_URI || '';

// Sample product data for CLOTHI e-commerce store
const sampleProducts = [
  // Men's Clothing
  {
    title: 'The Drift Tee',
    description: 'Our proprietary slub texture creates a natural, lived-in feel from the first wear. Crafted from 100% organic Pima cotton with a relaxed fit that drapes perfectly.',
    price: 68,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1622445275576-721325763afe?w=800',
    ],
    category: 'Men',
    badge: 'NEW',
    colors: ['Dune White', 'Clay', 'Forest', 'Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    materials: '100% Organic Pima Cotton',
    sizeGuide: 'True to size. Model wears size M.',
  },
  {
    title: 'Coastal Linen Shirt',
    description: 'A breezy linen shirt perfect for warm weather. Features a relaxed fit with a spread collar and coconut shell buttons.',
    price: 128,
    oldPrice: 158,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800',
    ],
    category: 'Men',
    badge: 'SALE',
    colors: ['Sky Blue', 'White', 'Sand'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    materials: '100% European Linen',
    sizeGuide: 'Relaxed fit. Size up for oversized look.',
  },
  {
    title: 'Heritage Chino Pants',
    description: 'Classic chinos with a modern slim fit. Made from brushed cotton twill with a hint of stretch for all-day comfort.',
    price: 118,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
    ],
    category: 'Men',
    badge: 'FEATURED',
    colors: ['Khaki', 'Navy', 'Olive', 'Stone'],
    sizes: ['28', '30', '32', '34', '36', '38'],
    materials: '98% Cotton, 2% Elastane',
    sizeGuide: 'Slim fit through hip and thigh.',
  },
  {
    title: 'Summit Fleece Pullover',
    description: 'Ultra-soft recycled fleece pullover with a quarter-zip design. Perfect for layering on cool mornings.',
    price: 148,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
    ],
    category: 'Men',
    badge: null,
    colors: ['Heather Grey', 'Navy', 'Forest Green'],
    sizes: ['S', 'M', 'L', 'XL'],
    materials: '100% Recycled Polyester Fleece',
    sizeGuide: 'Regular fit. True to size.',
  },
  {
    title: 'Driftwood Shorts',
    description: 'Versatile 7-inch shorts crafted from lightweight stretch cotton. Perfect for beach days or casual outings.',
    price: 78,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800',
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800',
    ],
    category: 'Men',
    badge: 'NEW',
    colors: ['Stone', 'Navy', 'Sage'],
    sizes: ['28', '30', '32', '34', '36'],
    materials: '97% Cotton, 3% Spandex',
    sizeGuide: 'Classic fit with 7" inseam.',
  },

  // Women's Clothing
  {
    title: 'Seaside Linen Dress',
    description: 'An effortlessly elegant midi dress in pure linen. Features a flattering wrap silhouette and adjustable tie waist.',
    price: 168,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
    ],
    category: 'Women',
    badge: 'NEW',
    colors: ['Natural', 'Terracotta', 'Ocean Blue'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    materials: '100% Premium Linen',
    sizeGuide: 'True to size. Model wears size S.',
  },
  {
    title: 'Cloud Cotton Tee',
    description: 'The softest tee you\'ll ever own. Made from our signature cloud cotton blend with a perfectly relaxed fit.',
    price: 58,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=800',
    images: [
      'https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=800',
    ],
    category: 'Women',
    badge: null,
    colors: ['White', 'Black', 'Blush', 'Sage'],
    sizes: ['XS', 'S', 'M', 'L'],
    materials: '60% Pima Cotton, 40% Modal',
    sizeGuide: 'Relaxed fit. Size down for fitted look.',
  },
  {
    title: 'Pacific Wide Leg Pants',
    description: 'Flowing wide-leg pants in lightweight crepe. Features a comfortable elastic waist and side pockets.',
    price: 138,
    oldPrice: 178,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
    ],
    category: 'Women',
    badge: 'SALE',
    colors: ['Black', 'Ivory', 'Olive'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    materials: '100% Viscose Crepe',
    sizeGuide: 'High-rise with wide leg silhouette.',
  },
  {
    title: 'Sunset Cardigan',
    description: 'A lightweight knit cardigan perfect for layering. Features mother-of-pearl buttons and ribbed trim.',
    price: 128,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
    ],
    category: 'Women',
    badge: 'FEATURED',
    colors: ['Oatmeal', 'Dusty Rose', 'Sky'],
    sizes: ['XS', 'S', 'M', 'L'],
    materials: '70% Cotton, 30% Linen',
    sizeGuide: 'Relaxed fit. True to size.',
  },
  {
    title: 'Marina Pleated Skirt',
    description: 'An elegant pleated midi skirt that moves beautifully. Pairs perfectly with our Cloud Cotton Tee.',
    price: 118,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0edd0?w=800',
    images: [
      'https://images.unsplash.com/photo-1583496661160-fb5886a0edd0?w=800',
    ],
    category: 'Women',
    badge: null,
    colors: ['Navy', 'Cream', 'Blush'],
    sizes: ['XS', 'S', 'M', 'L'],
    materials: '100% Polyester',
    sizeGuide: 'Sits at natural waist.',
  },

  // Accessories
  {
    title: 'Woven Leather Belt',
    description: 'Hand-woven leather belt with antique brass buckle. A timeless accessory that elevates any outfit.',
    price: 88,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800',
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800',
    ],
    category: 'Accessories',
    badge: null,
    colors: ['Tan', 'Dark Brown', 'Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    materials: '100% Genuine Leather',
    sizeGuide: 'S: 28-30", M: 32-34", L: 36-38", XL: 40-42"',
  },
  {
    title: 'Canvas Weekender Bag',
    description: 'The perfect travel companion. Durable waxed canvas with leather trim and brass hardware.',
    price: 198,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    ],
    category: 'Accessories',
    badge: 'FEATURED',
    colors: ['Olive', 'Navy', 'Tan'],
    sizes: ['One Size'],
    materials: 'Waxed Canvas, Leather Trim',
    sizeGuide: '20" L x 10" W x 12" H',
  },
  {
    title: 'Sunrise Sunglasses',
    description: 'Classic aviator sunglasses with polarized lenses. Lightweight titanium frame for all-day comfort.',
    price: 168,
    oldPrice: 198,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
    ],
    category: 'Accessories',
    badge: 'SALE',
    colors: ['Gold/Green', 'Silver/Blue', 'Black/Grey'],
    sizes: ['One Size'],
    materials: 'Titanium Frame, Polarized Glass Lenses',
    sizeGuide: 'Lens Width: 58mm',
  },
  {
    title: 'Merino Wool Beanie',
    description: 'Ultra-soft merino wool beanie that regulates temperature naturally. Perfect for cool weather.',
    price: 48,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800',
    images: [
      'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800',
    ],
    category: 'Accessories',
    badge: 'NEW',
    colors: ['Charcoal', 'Oatmeal', 'Navy', 'Burgundy'],
    sizes: ['One Size'],
    materials: '100% Merino Wool',
    sizeGuide: 'One size fits most.',
  },

  // Footwear
  {
    title: 'Canvas Espadrilles',
    description: 'Classic espadrilles with hand-stitched jute sole. The ultimate summer slip-on.',
    price: 78,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
    ],
    category: 'Footwear',
    badge: null,
    colors: ['Navy', 'Natural', 'Olive'],
    sizes: ['7', '8', '9', '10', '11', '12'],
    materials: 'Cotton Canvas, Jute Sole',
    sizeGuide: 'Runs true to size.',
  },
  {
    title: 'Leather Boat Shoes',
    description: 'Premium full-grain leather boat shoes with hand-sewn construction. A nautical classic.',
    price: 158,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800',
    images: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800',
    ],
    category: 'Footwear',
    badge: 'FEATURED',
    colors: ['Tan', 'Navy', 'Brown'],
    sizes: ['7', '8', '9', '10', '11', '12', '13'],
    materials: 'Full-Grain Leather, Rubber Sole',
    sizeGuide: 'Runs slightly large. Consider sizing down.',
  },
  {
    title: 'Suede Ankle Boots',
    description: 'Versatile suede ankle boots with a sleek silhouette. Features a comfortable block heel.',
    price: 218,
    oldPrice: 268,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
    ],
    category: 'Footwear',
    badge: 'SALE',
    colors: ['Taupe', 'Black', 'Cognac'],
    sizes: ['5', '6', '7', '8', '9', '10'],
    materials: 'Italian Suede, Leather Sole',
    sizeGuide: 'True to size.',
  },
  {
    title: 'Minimalist Sneakers',
    description: 'Clean, minimalist leather sneakers with premium comfort. Handcrafted in Portugal.',
    price: 178,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
    ],
    category: 'Footwear',
    badge: 'NEW',
    colors: ['White', 'Black', 'Grey'],
    sizes: ['7', '8', '9', '10', '11', '12'],
    materials: 'Full-Grain Leather, Rubber Sole',
    sizeGuide: 'Runs true to size.',
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('Existing products cleared');

    // Insert new products
    console.log('Inserting sample products...');
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully inserted ${insertedProducts.length} products`);

    // Log product IDs for reference
    console.log('\nProduct IDs:');
    insertedProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.title}: ${product._id}`);
    });

    console.log('\nSeed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed
seed();
