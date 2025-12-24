#!/usr/bin/env node

/**
 * Simple script to run the image migration
 * Usage: node scripts/run-migration.js
 */

const { migrateImages } = require('./migrate-images');

console.log('🚀 Starting image migration...\n');
migrateImages()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });

