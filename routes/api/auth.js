const express = require("express");

const { user } = require("../../model");
const { joiSchema } = require("../../model/user");

const router = express.Router();

// registrations
router.post("/register", async (req, res, next) => {
  try {
    console.log(joiSchema);
    const { error } = joiSchema.validate(req.body);
    if (error) {
      error.status = 400;
      throw error;
    }
  } catch (error) {
    next(error);
  }
});
module.exports = router;
