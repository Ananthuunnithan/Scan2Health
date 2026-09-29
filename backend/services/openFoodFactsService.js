const axios = require('axios');

const OPEN_FOOD_FACTS_BASE_URL =
  'https://world.openfoodfacts.org/api/v3/product';

const USER_AGENT =
  'Scan2Health/1.0 (MCA Student Project)';

const gramsToMg = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number * 1000;
};

const getProductByBarcode = async (barcode) => {
  const response = await axios.get(
    `${OPEN_FOOD_FACTS_BASE_URL}/${encodeURIComponent(barcode)}`,
    {
      headers: {
        'User-Agent': USER_AGENT,
      },
      timeout: 10000,
    }
  );

  return response.data;
};

module.exports = {
  getProductByBarcode,
};