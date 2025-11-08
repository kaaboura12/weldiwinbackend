/**
 * Script to drop the email_1 index from the children collection
 * Run this script with: node drop-email-index.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weldiwin';

async function dropEmailIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;
    const collection = db.collection('children');

    // Check existing indexes
    console.log('\nExisting indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(idx => {
      console.log(`- ${idx.name}:`, JSON.stringify(idx.key));
    });

    // Drop the email_1 index if it exists
    try {
      await collection.dropIndex('email_1');
      console.log('\n✅ Successfully dropped email_1 index');
    } catch (error) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('\n⚠️  email_1 index does not exist (already dropped or never created)');
      } else {
        throw error;
      }
    }

    // Show remaining indexes
    console.log('\nRemaining indexes:');
    const remainingIndexes = await collection.indexes();
    remainingIndexes.forEach(idx => {
      console.log(`- ${idx.name}:`, JSON.stringify(idx.key));
    });

    await mongoose.disconnect();
    console.log('\n✅ Done! Database connection closed.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

dropEmailIndex();

