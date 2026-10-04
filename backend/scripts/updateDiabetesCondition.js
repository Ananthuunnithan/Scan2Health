const mongoose = require('mongoose');
require('dotenv').config();

const HealthCondition = require('../models/HealthCondition');

const MONGODB_URI = process.env.MONGODB_URI;

const updateDiabetesCondition = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('MongoDB connected.');

    const updatedCondition =
      await HealthCondition.findOneAndUpdate(
        { code: 'DIABETES' },
        {
          $set: {
            nutritionFocus: [
              'carbohydrates',
              'sugars',
              'fiber',
            ],
            nutrientsToLimit: [
              'sugars',
            ],
            nutrientsToMonitor: [
              'carbohydrates',
            ],
            nutrientsToPrefer: [
              'fiber',
            ],
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedCondition) {
      console.log('DIABETES condition not found.');
      return;
    }

    console.log('DIABETES condition updated successfully.');

    console.log(
      JSON.stringify(updatedCondition, null, 2)
    );
  } catch (error) {
    console.error(
      'Failed to update DIABETES condition:',
      error.message
    );
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

updateDiabetesCondition();