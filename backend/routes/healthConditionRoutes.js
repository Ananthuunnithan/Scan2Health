const express = require("express");

const {
  getHealthConditions,
  getHealthConditionByCode,
} = require("../controllers/healthConditionController");

const authenticateFirebase = require("../middleware/authenticateFirebase");

const router = express.Router();


// Get all health conditions
router.get(
  "/",
  authenticateFirebase,
  getHealthConditions
);


// Get a specific health condition
router.get(
  "/:code",
  authenticateFirebase,
  getHealthConditionByCode
);


module.exports = router;