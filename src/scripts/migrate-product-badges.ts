import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Product } from '../models/Product.js';

const badgeMap: Record<string, string> = {
  NEW: 'new',
  SALE: 'bestseller',
  FEATURED: 'premium',
  LIMITED: 'premium',
};

async function migrateBadges() {
  await connectDatabase();

  const products = await Product.find({ badge: { $in: Object.keys(badgeMap) } });
  if (products.length === 0) {
    console.log('No badges to migrate.');
    await disconnectDatabase();
    return;
  }

  let updatedCount = 0;
  for (const product of products) {
    const current = product.badge as string;
    const next = badgeMap[current];
    if (!next) continue;
    product.badge = next;
    await product.save();
    updatedCount++;
  }

  console.log(`Updated badges for ${updatedCount} products.`);
  await disconnectDatabase();
}

migrateBadges().catch((error) => {
  console.error('Badge migration failed:', error);
  process.exit(1);
});
