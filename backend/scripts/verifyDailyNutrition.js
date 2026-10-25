
require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env')
});

const connectDB = require('../config/db');
const mongoose = require('mongoose');
const ConsumedFood = require('../models/ConsumedFood');

const NUTRIENTS = [
  'calories',
  'protein',
  'carbohydrates',
  'total_fat',
  'saturated_fat',
  'trans_fat',
  'sugars',
  'fiber',
  'sodium',
  'cholesterol',
  'iron',
  'calcium',
  'potassium',
  'vitamin_a',
  'vitamin_c',
  'vitamin_d',
  'vitamin_b12',
  'folate',
];

async function main() {
  try {
    await connectDB();

    // Enter the Firebase UID of the account used in the app.
    const userId = process.env.TEST_FIREBASE_UID;

    if (!userId) {
      throw new Error(
        'Set TEST_FIREBASE_UID in your local environment before running.'
      );
    }

    // Today's date in Asia/Kolkata.
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());

    const dateParts = Object.fromEntries(
      parts.map(({ type, value }) => [type, value])
    );

    const dateString =
      `${dateParts.year}-${dateParts.month}-${dateParts.day}`;

    const [year, month, day] = dateString.split('-').map(Number);

    const start = new Date(
      Date.UTC(year, month - 1, day) - 330 * 60 * 1000
    );

    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const foods = await ConsumedFood.find({
      userId,
      consumedAt: { $gte: start, $lt: end },
    })
      .select('barcode consumedAt quantity servingConsumed nutritionConsumed')
      .sort({ consumedAt: 1 })
      .lean();

    const totals = Object.fromEntries(
      NUTRIENTS.map((field) => [field, null])
    );

    for (const food of foods) {
      for (const field of NUTRIENTS) {
        const value = food.nutritionConsumed?.[field];

        if (typeof value !== 'number' || !Number.isFinite(value)) {
          continue;
        }

        totals[field] =
          totals[field] === null ? value : totals[field] + value;
      }
    }

    console.log('\nDate (Asia/Kolkata):', dateString);
    console.log('Recorded food count:', foods.length);
    console.log('\nCalculated totals:');
    console.table(totals);

    console.log('\nSaved records:');
    console.table(
    foods.map((food) => ({
        barcode: food.barcode,
        consumedAt: food.consumedAt?.toISOString(),
        quantity: food.quantity,
        calories: food.nutritionConsumed?.calories ?? null,
        total_fat: food.nutritionConsumed?.total_fat ?? null,
        saturated_fat: food.nutritionConsumed?.saturated_fat ?? null,
        trans_fat: food.nutritionConsumed?.trans_fat ?? null,
        vitamin_a: food.nutritionConsumed?.vitamin_a ?? null,
        vitamin_c: food.nutritionConsumed?.vitamin_c ?? null,
        vitamin_d: food.nutritionConsumed?.vitamin_d ?? null,
        vitamin_b12: food.nutritionConsumed?.vitamin_b12 ?? null,
        sodium: food.nutritionConsumed?.sodium ?? null,
    }))
    );
  } catch (error) {
    console.error('Verification failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
