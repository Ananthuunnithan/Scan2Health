const mongoose = require('mongoose');

const ACTIVITY_LEVELS = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'];
const GOALS = ['Weight Loss', 'Weight Maintenance', 'Weight Gain', 'Muscle Gain', 'General Healthy Eating'];
const DIETARY_PREFERENCES = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian', 'Other'];
const ALLERGIES = ['Peanut', 'Milk', 'Egg', 'Soy', 'Gluten', 'Other'];
const SEXES = ['Female', 'Male', 'Intersex', 'Prefer not to say'];

const userProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true, trim: true },
  basicInfo: {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    age: { type: Number, required: true, min: 1, max: 120 },
    sex: { type: String, required: true, enum: SEXES },
    heightCm: { type: Number, required: true, min: 40, max: 300 },
    weightKg: { type: Number, required: true, min: 2, max: 500 },
  },
  healthConditions: { type: [String],default: [],},
  lifestyle: { activityLevel: { type: String, required: true, enum: ACTIVITY_LEVELS } },
  goals: { primary: { type: String, required: true, enum: GOALS } },
  diet: {
    preference: { type: String, required: true, enum: DIETARY_PREFERENCES },
    allergies: { type: [String], enum: ALLERGIES, default: [] },
  },
}, { timestamps: true, versionKey: false, strict: 'throw' });

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
module.exports = UserProfile;
module.exports.options = { ACTIVITY_LEVELS, GOALS, DIETARY_PREFERENCES, ALLERGIES, SEXES };
