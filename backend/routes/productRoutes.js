const express = require('express');

const {
  getProducts,
  getProductByBarcode,
  createProduct,
} = require('../controllers/productController');

const authenticateFirebase = require('../middleware/authenticateFirebase');

const router = express.Router();

router.use(authenticateFirebase);

router.get('/', getProducts);

router.get('/barcode/:barcode', getProductByBarcode);

router.post('/', createProduct);

module.exports = router;