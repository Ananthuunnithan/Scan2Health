
const ConsumedFood = require('../models/ConsumedFood');

// Database field -> API response field.
const NUTRITION_FIELDS = [
  ['calories', 'calories'],
  ['protein', 'protein'],
  ['carbohydrates', 'carbohydrates'],
  ['total_fat', 'totalFat'],
  ['saturated_fat', 'saturatedFat'],
  ['trans_fat', 'transFat'],
  ['sugars', 'sugars'],
  ['fiber', 'fiber'],
  ['sodium', 'sodium'],
  ['cholesterol', 'cholesterol'],
  ['iron', 'iron'],
  ['calcium', 'calcium'],
  ['potassium', 'potassium'],
  ['vitamin_a', 'vitaminA'],
  ['vitamin_c', 'vitaminC'],
  ['vitamin_d', 'vitaminD'],
  ['vitamin_b12', 'vitaminB12'],
  ['folate', 'folate'],
];

const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function getISTDayRange(dateString) {
  if (!dateString) {
    throw new Error('Date is required.');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error('Date must be in YYYY-MM-DD format.');
  }

  const [year, month, day] = dateString.split('-').map(Number);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));

  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    throw new Error('Invalid calendar date.');
  }

  const start = new Date(
    Date.UTC(year, month - 1, day) - IST_OFFSET_MS
  );
  const end = new Date(start.getTime() + DAY_MS);

  return { start, end };
}

async function getDailyNutrition(userId, dateString) {
  if (!userId) {
    throw new Error('User ID is required.');
  }

  const { start, end } = getISTDayRange(dateString);

  const consumedFoods = await ConsumedFood.find({
    userId,
    consumedAt: {
      $gte: start,
      $lt: end,
    },
  })
    .populate('productId', 'productName brand')
    .sort({ consumedAt: 1 })
    .lean();

  const totals = {};

  for (const [, responseField] of NUTRITION_FIELDS) {
    totals[responseField] = null;
  }

  for (const food of consumedFoods) {
    const nutrition = food.nutritionConsumed || {};

    for (const [databaseField, responseField] of NUTRITION_FIELDS) {
      const value = nutrition[databaseField];

      if (
        value === null ||
        value === undefined ||
        typeof value !== 'number' ||
        !Number.isFinite(value)
      ) {
        continue;
      }

      if (totals[responseField] === null) {
        totals[responseField] = value;
      } else {
        totals[responseField] += value;
      }
    }
  }

  return {
    date: dateString,
    timezone: 'Asia/Kolkata',
    period: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
    foodCount: consumedFoods.length,
    totals,
    foods: consumedFoods,
  };
}

async function getWeeklyNutrition(userId, endDateString) {
  if (!userId) {
    throw new Error('User ID is required.');
  }

  // Validate the date and use UTC calendar arithmetic so the
  // seven date labels do not depend on the server's timezone.
  getISTDayRange(endDateString);

  const [year, month, day] = endDateString.split('-').map(Number);
  const endDate = new Date(Date.UTC(year, month - 1, day));
  const dailyCalories = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(endDate.getTime());
    date.setUTCDate(date.getUTCDate() - i);

    const dateString =
      `${date.getUTCFullYear()}-` +
      `${String(date.getUTCMonth() + 1).padStart(2, '0')}-` +
      `${String(date.getUTCDate()).padStart(2, '0')}`;

    const dailyNutrition = await getDailyNutrition(userId, dateString);

    dailyCalories.push({
      date: dateString,
      calories: dailyNutrition.totals.calories ?? 0,
    });
  }

  const totalCalories = dailyCalories.reduce(
    (total, item) => total + item.calories,
    0
  );

  const averageDailyCalories = totalCalories / 7;
  const weeklyGoal = 2000 * 7;
  const progress = Math.min(totalCalories / weeklyGoal, 1);

  return {
    startDate: dailyCalories[0].date,
    endDate: dailyCalories[6].date,
    timezone: 'Asia/Kolkata',
    dailyCalorieGoal: 2000,
    weeklyCalorieGoal: weeklyGoal,
    totalCalories,
    averageDailyCalories,
    progress,
    days: dailyCalories,
  };
}

module.exports = {
  getDailyNutrition,
  getISTDayRange,
  getWeeklyNutrition,
};
