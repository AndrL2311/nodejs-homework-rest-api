const express = require("express");
const { BadRequest, Conflict, Unauthorized, NotFound } = require("http-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");

const { User } = require("../../model");
const {
  joiRegisterSchema,
  joiLoginSchema,
  joiSubscriptionSchema,
} = require("../../model/user");
const { sendEmail } = require("../../helpers");
const { authenticate, upload } = require("../../middlewares");

const router = express.Router();
const avatarDir = path.join(__dirname, "../../", "public", "avatars");
const { SECRET_KEY, SITE_NAME } = process.env;

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
    const verificationToken = nanoid();
    const avatarURL = gravatar.url(
      email,
      { s: "250", r: "g", d: "wavatar" },
      false
    );
    const newUser = await User.create({
      email,
      verificationToken,
      password: hashPassword,
      subscription,
      avatarURL,
    });

    const dataEmail = {
      to: email,
      subject: "Подтвердите email",
      html: `<a target="_blank" href="${SITE_NAME}/api/users/verify/${verificationToken}">Подтвердить email</a>`,
    };

    await sendEmail(dataEmail);

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
    if (!user.verify) {
      throw new Unauthorized("Email not verify");
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

// Обновить поле подписки subscription
router.patch("/:userId/subscription", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { subscription } = req.body;

    const { error } = joiSubscriptionSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { subscription },
      {
        new: true,
      }
    );
    if (!updateUser) {
      throw new NotFound(error.message);
    }

    res.json(updateUser);
  } catch (error) {
    if (error.message.includes("failed for value")) {
      error.status = 404;
    }
    next(error);
  }
});

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      if (req.file === undefined) {
        const error = new Error("Image avatar is not found");
        error.status = 404;
        throw error;
      }
      const { path: tempUpload, filename } = req.file;
      const [extension] = filename.split(".").reverse();
      const newFileName = `${req.user._id}.${extension}`;
      const fileUpload = path.join(avatarDir, newFileName);

      // Преобразуем и записываем изображение в public/avatars
      await Jimp.read(tempUpload)
        .then((image) => {
          return image
            .resize(250, 250) // resize
            .quality(60) // set JPEG quality
            .write(fileUpload); // save
        })

        .catch((error) => {
          console.error(error);
        });

      // Подчищаем изображение из папки tmp
      await fs.rm(tempUpload);

      const avatarURL = path.join("avatars", newFileName);
      await User.findByIdAndUpdate(req.user._id, { avatarURL }, { new: true });
      res.json({ avatarURL });
    } catch (error) {
      if (error.message.includes("failed for value")) {
        error.status = 404;
      }
      next(error);
    }
  }
);

//Проветка верификации токена по ссылке из письма
router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw new NotFound("User not found");
    }
    await User.findOneAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });
    res.json({ mesage: "Verification succesful" });
  } catch (error) {
    next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new BadRequest("Missing required field email");
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFound("User not found");
    }
    if (user.verify) {
      throw new BadRequest("Verification has already been passed");
    }
    const { verificationToken } = user;

    const dataEmail = {
      to: email,
      subject: "Подтвердите email",
      html: `<a target="_blank" href="${SITE_NAME}/api/users/verify/${verificationToken}">Подтвердить email</a>`,
    };
    await sendEmail(dataEmail);

    res.json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
