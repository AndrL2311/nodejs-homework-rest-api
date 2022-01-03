const express = require("express");
const { BadRequest, Conflict, Unauthorized } = require("http-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require("../../model");
const { joiRegisterSchema, joiLoginSchema } = require("../../model/user");
const { authenticate } = require("../../middlewares");

const router = express.Router();
const { SECRET_KEY } = process.env;

// Регистрация
router.post("/signup", async (req, res, next) => {
  try {
    const { error } = joiRegisterSchema.validate(req.body);

    if (error) {
      throw new BadRequest(error.message);
    }
    const { email, password, subscription } = req.body;

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
    });
    res.status(201).json({
      user: { email: newUser.email, subscription: newUser.subscription },
    });
  } catch (error) {
    next(error);
  }
});

// Логин
router.post("/login", async (req, res, next) => {
  try {
    const { error } = joiLoginSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Unauthorized("Email or password is wrong");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw new Unauthorized("Email or password is wrong");
    }

    const { _id, subscription } = user;
    const payload = { id: _id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
    await User.findByIdAndUpdate(_id, { token });
    res.json({
      token,
      user: {
        email,
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Данные текущего пользователя по токину
router.get("/current", authenticate, async (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    user: { email, subscription },
  });
});

// Логаут
router.get("/logout", authenticate, async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).send();
});

module.exports = router;
