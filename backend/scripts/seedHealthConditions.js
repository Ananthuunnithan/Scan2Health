require("dotenv").config();

const mongoose = require("mongoose");
const HealthCondition = require("../models/HealthCondition");

const healthConditions = [
  {
    name: "Diabetes",
    code: "DIABETES",
    category: "metabolic",
    description:
      "A condition involving blood glucose regulation.",
    nutritionFocus: [
      "carbohydrates",
      "sugars",
      "fiber",
    ],

    nutrientsToLimit: [
      "sugars",
    ],

    nutrientsToMonitor: [
      "carbohydrates",
    ],
    nutrientsToPrefer: [
      "fiber",
    ],
    active: true,
  },

  {
    name: "Hypertension",
    code: "HYPERTENSION",
    category: "cardiovascular",
    description:
      "A condition involving elevated blood pressure.",
    nutritionFocus: [
      "sodium",
      "potassium",
    ],
    nutrientsToLimit: [
      "sodium",
    ],
    nutrientsToMonitor: [],
    nutrientsToPrefer: [
      "potassium",
      "fiber",
    ],
    active: true,
  },

  {
    name: "High Cholesterol",
    code: "HIGH_CHOLESTEROL",
    category: "cardiovascular",
    description:
      "A condition involving elevated blood cholesterol levels.",
    nutritionFocus: [
      "saturated_fat",
      "trans_fat",
      "fiber",
    ],
    nutrientsToLimit: [
      "saturated_fat",
      "trans_fat",
    ],
    nutrientsToMonitor: [],
    nutrientsToPrefer: [
      "fiber",
    ],
    active: true,
  },

  {
    name: "Obesity",
    code: "OBESITY",
    category: "metabolic",
    description:
      "A condition involving excess body fat that may affect health.",
    nutritionFocus: [
      "calories",
      "protein",
      "fiber",
    ],
    
    nutrientsToLimit: [],
    nutrientsToMonitor: [
      "calories",
    ],
    nutrientsToPrefer: [
      "protein",
      "fiber",
    ],
    active: true,
  },

  {
    name: "Iron Deficiency Anemia",
    code: "IRON_DEFICIENCY_ANEMIA",
    category: "nutritional",
    description:
      "A condition associated with inadequate iron availability.",
    nutritionFocus: [
      "iron",
      "vitamin_c",
    ],
    nutrientsToLimit: [],
    nutrientsToMonitor: [
      "iron",
    ],
    nutrientsToPrefer: [
      "iron",
      "vitamin_c",
    ],
    active: true,
  },

  {
    name: "Kidney Disease",
    code: "KIDNEY_DISEASE",
    category: "renal",
    description:
      "A condition involving impaired kidney function.",
    nutritionFocus: [
      "sodium",
      "protein",
      "potassium",
    ],
    nutrientsToLimit: [],
    nutrientsToMonitor: [
      "protein",
      "potassium",
      "sodium",
    ],
    nutrientsToPrefer: [],
    active: true,
  },

  {
    name: "Celiac Disease",
    code: "CELIAC_DISEASE",
    category: "digestive",
    description:
      "A condition requiring avoidance of gluten.",
    nutritionFocus: [
      "gluten",
    ],
    nutrientsToLimit: [
      "gluten",
    ],
    nutrientsToMonitor: [],
    nutrientsToPrefer: [],
    active: true,
  },

  {
    name: "Lactose Intolerance",
    code: "LACTOSE_INTOLERANCE",
    category: "digestive",
    description:
      "A condition involving difficulty digesting lactose.",
    nutritionFocus: [
      "lactose",
    ],
    nutrientsToLimit: [
      "lactose",
    ],
    nutrientsToMonitor: [],
    nutrientsToPrefer: [],
    active: true,
  },
];

async function seedHealthConditions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected.");

    await HealthCondition.deleteMany({});

    await HealthCondition.insertMany(healthConditions);

    console.log(
      `${healthConditions.length} health conditions inserted successfully.`
    );

    await mongoose.connection.close();

    console.log("MongoDB connection closed.");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedHealthConditions();