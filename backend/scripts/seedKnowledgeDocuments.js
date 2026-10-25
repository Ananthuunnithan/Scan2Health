require('dotenv').config();

const mongoose = require('mongoose');

const KnowledgeDocument = require('../models/KnowledgeDocument');

const knowledgeDocuments = [
  {
    title: 'Dietary Fibre and Healthy Diet',
    topic: 'fiber',
    category: 'NUTRIENT',
    conditionCodes: [],
    nutrients: ['fiber'],
    content:
      'Dietary fibre is an important component of a healthy diet. WHO guidance states that people older than 10 years should consume at least 25 g of naturally occurring dietary fibre per day. Fibre is obtained from foods such as whole grains, vegetables, fruits and pulses.',
    keywords: [
      'fiber',
      'dietary fibre',
      '25 g',
      'whole grains',
      'vegetables',
      'fruits',
      'pulses'
    ],
    source: {
      name: 'WHO',
      reference: 'Healthy diet',
      version: '2026'
    },
    active: true
  },

  {
    title: 'Free Sugars and Healthy Diet',
    topic: 'sugars',
    category: 'NUTRIENT',
    conditionCodes: [],
    nutrients: ['sugars'],
    content:
      'WHO recommends limiting free sugars to less than 10% of total daily energy intake. A further reduction to below 5% of total energy intake may provide additional health benefits. Free sugars include sugars added to foods and beverages as well as sugars naturally present in honey, syrups, fruit juices and fruit juice concentrates.',
    keywords: [
      'sugar',
      'free sugars',
      'added sugar',
      '10 percent',
      '5 percent'
    ],
    source: {
      name: 'WHO',
      reference: 'Healthy diet',
      version: '2026'
    },
    active: true
  },

  {
    title: 'Sodium Intake',
    topic: 'sodium',
    category: 'NUTRIENT',
    conditionCodes: ['HYPERTENSION'],
    nutrients: ['sodium'],
    content:
      'WHO recommends that adults consume less than 2000 mg of sodium per day, equivalent to less than 5 g of salt per day. Reducing sodium intake can help reduce blood pressure and the risk of cardiovascular disease.',
    keywords: [
      'sodium',
      'salt',
      '2000 mg',
      '5 g salt',
      'blood pressure',
      'hypertension'
    ],
    source: {
      name: 'WHO',
      reference: 'Sodium reduction',
      version: '2026'
    },
    active: true
  },

  {
    title: 'Salt Intake',
    topic: 'salt',
    category: 'DIETARY_GUIDANCE',
    conditionCodes: ['HYPERTENSION'],
    nutrients: ['sodium'],
    content:
      'Salt is a major dietary source of sodium. WHO recommends limiting salt intake to less than 5 g per day in adults, corresponding to less than 2000 mg of sodium per day.',
    keywords: [
      'salt',
      'sodium',
      '5 g',
      '2000 mg',
      'hypertension'
    ],
    source: {
      name: 'WHO',
      reference: 'Sodium reduction',
      version: '2026'
    },
    active: true
  },

  {
    title: 'Total Fat Intake',
    topic: 'total_fat',
    category: 'NUTRIENT',
    conditionCodes: [],
    nutrients: ['total_fat'],
    content:
      'WHO recommends that total fat intake should generally not exceed 30% of total daily energy intake for adults to help maintain a healthy diet and reduce the risk of unhealthy weight gain.',
    keywords: [
      'fat',
      'total fat',
      'dietary fat',
      '30 percent'
    ],
    source: {
      name: 'WHO',
      reference: 'Healthy diet',
      version: '2026'
    },
    active: true
  },

  {
    title: 'Saturated Fat',
    topic: 'saturated_fat',
    category: 'NUTRIENT',
    conditionCodes: [],
    nutrients: ['saturated_fat'],
    content:
      'WHO recommends that saturated fat intake should be limited to less than 10% of total daily energy intake. Saturated fats are commonly found in fatty meat, butter, cream, cheese, ghee, palm oil and coconut oil.',
    keywords: [
      'saturated fat',
      '10 percent',
      'butter',
      'ghee',
      'cheese'
    ],
    source: {
      name: 'WHO',
      reference: 'Healthy diet',
      version: '2026'
    },
    active: true
  },

  {
    title: 'Trans Fat',
    topic: 'trans_fat',
    category: 'NUTRIENT',
    conditionCodes: [],
    nutrients: ['trans_fat'],
    content:
      'WHO recommends limiting trans fat intake to less than 1% of total daily energy intake. Industrially produced trans fats should be avoided as much as possible because they are not part of a healthy diet.',
    keywords: [
      'trans fat',
      'industrial trans fat',
      '1 percent',
      'healthy diet'
    ],
    source: {
      name: 'WHO',
      reference: 'Healthy diet',
      version: '2026'
    },
    active: true
  },

  {
    title: 'Fruits and Vegetables',
    topic: 'fruits_vegetables',
    category: 'DIETARY_GUIDANCE',
    conditionCodes: [],
    nutrients: ['fiber'],
    content:
      'WHO recommends consuming at least 400 g of fruits and vegetables per day for people older than 10 years. Fruits and vegetables are important sources of dietary fibre, vitamins, minerals and other beneficial compounds.',
    keywords: [
      'fruits',
      'vegetables',
      '400 g',
      'dietary fibre',
      'healthy diet'
    ],
    source: {
      name: 'WHO',
      reference: 'Healthy diet',
      version: '2026'
    },
    active: true
  }
];


async function seedKnowledgeDocuments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected.');

    await KnowledgeDocument.deleteMany({});

    await KnowledgeDocument.insertMany(
      knowledgeDocuments
    );

    console.log(
      `${knowledgeDocuments.length} knowledge documents inserted successfully.`
    );

    await mongoose.connection.close();

    console.log('MongoDB connection closed.');

  } catch (error) {
    console.error(
      'Knowledge document seeding failed:',
      error
    );

    process.exit(1);
  }
}


seedKnowledgeDocuments();