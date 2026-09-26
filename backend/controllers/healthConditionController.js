const HealthCondition = require("../models/HealthCondition");

const getHealthConditions = async (req, res) => {
  try {
    const conditions = await HealthCondition.find({
      active: true,
    }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: conditions,
    });

  } catch (error) {
    console.error(
      "Error fetching health conditions:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch health conditions.",
    });
  }
};


const getHealthConditionByCode = async (req, res) => {
  try {
    const condition = await HealthCondition.findOne({
      code: req.params.code.toUpperCase(),
      active: true,
    });

    if (!condition) {
      return res.status(404).json({
        success: false,
        message: "Health condition not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: condition,
    });

  } catch (error) {
    console.error(
      "Error fetching health condition:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch health condition.",
    });
  }
};


module.exports = {
  getHealthConditions,
  getHealthConditionByCode,
};