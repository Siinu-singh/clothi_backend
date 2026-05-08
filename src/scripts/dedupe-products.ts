import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Product } from '../models/Product.js';

const run = async () => {
  await connectDatabase();

  const dryRun = process.argv.includes('--dry-run');

  const groups = await Product.aggregate([
    {
      $addFields: {
        normTitle: { $toLower: { $trim: { input: '$title' } } },
        normCategory: { $toLower: { $trim: { input: '$category' } } },
      },
    },
    {
      $group: {
        _id: { title: '$normTitle', category: '$normCategory' },
        ids: { $push: '$_id' },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  let totalRemoved = 0;
  let totalGroups = 0;

  for (const group of groups) {
    const docs = await Product.find({ _id: { $in: group.ids } })
      .sort({ createdAt: 1 })
      .select('_id title category createdAt');

    if (docs.length <= 1) {
      continue;
    }

    totalGroups += 1;
    const keep = docs[0];
    const removeIds = docs.slice(1).map((doc) => doc._id);

    if (!dryRun) {
      await Product.deleteMany({ _id: { $in: removeIds } });
    }

    totalRemoved += removeIds.length;
    console.log(
      `${dryRun ? '[dry-run] ' : ''}Removed ${removeIds.length} duplicates for ${keep.title} / ${keep.category}`
    );
  }

  console.log(
    `${dryRun ? '[dry-run] ' : ''}Deduped ${totalGroups} groups. Removed ${totalRemoved} duplicates.`
  );

  await disconnectDatabase();
};

run().catch(async (error) => {
  console.error('Failed to dedupe products:', error);
  await disconnectDatabase();
  process.exit(1);
});
