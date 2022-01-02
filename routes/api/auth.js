const express = require("express");
const { BadRequest, Conflict } = require("http-errors");
const bcrypt = require("bcryptjs");

const { User } = require("../../model");
const { joiSchema } = require("../../model/user");

const router = express.Router();

// registrations
router.post("/register", async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);

    if (error) {
      console.log(error);
      throw new BadRequest(error.message);
    }
    const { email, password, subscription, token } = req.body;
    console.log(subscription);
    const user = await User.findOne({ email });
    if (user) {
      throw new Conflict("Email in use");
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      email,
      password: hashPassword,
      subscription,
      token,
    });
    res.status(201).json({
      user: { email: newUser.email, subscription: newUser.subscription },
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
