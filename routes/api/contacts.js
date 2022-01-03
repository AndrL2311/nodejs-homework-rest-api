const express = require("express");
const router = express.Router();

const { authenticate } = require("../../middlewares");
const { Contact } = require("../../model");
const { joiSchema } = require("../../model/contact");

// 1. Получить все контакты.
router.get("/", authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { _id } = req.user;
    const skip = (page - 1) * limit;
    const contacts = await Contact.find(
      { owner: _id },
      "-createdAt -updatedAt",
      { skip, limit: +limit }
    );
    res.json(contacts);
  } catch (err) {
    next(err);
  }
});

// 2. Получить один контакт по id.
router.get("/:contactId", authenticate, async (req, res, next) => {
  const { contactId } = req.params;
  const { _id } = req.user;
  try {
    const contact = await Contact.findOne(
      { _id: contactId, owner: _id },
      "-createdAt -updatedAt"
    );
    if (!contact) {
      const error = new Error("Not found");
      error.status = 404;
      throw error;
    }

    res.json(contact);
  } catch (err) {
    if (err.message.includes("Cast to ObjectId failed")) {
      err.status = 404;
    }
    next(err);
  }
});

// 3. Добавить контакт в список.
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      error.status = 400;
      throw error;
    }
    const { _id } = req.user;
    const newContact = await Contact.create({ ...req.body, owner: _id });
    res.status(201).json(newContact);
  } catch (err) {
    if (err.message.includes("validation failed")) {
      err.status = 404;
    }
    next(err);
  }
});

// 4. Обновить контакт по id.
router.put("/:contactId", authenticate, async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      error.status = 400;
      throw error;
    }
    const { contactId } = req.params;
    const { _id } = req.user;

    const updateContact = await Contact.findOneAndUpdate(
      { _id: contactId, owner: _id },
      req.body,
      {
        new: true,
      }
    );
    if (!updateContact) {
      const error = new Error("Not found");
      error.status = 404;
      throw error;
    }

    res.json(updateContact);
  } catch (err) {
    if (err.message.includes("validation failed")) {
      err.status = 404;
    }
    next(err);
  }
});

// 5. Удалить контакт по id.
router.delete("/:contactId", authenticate, async (req, res, next) => {
  const { contactId } = req.params;
  const { _id } = req.user;

  try {
    const deleteContact = await Contact.findOneAndRemove({
      _id: contactId,
      owner: _id,
    });

    if (!deleteContact) {
      const error = new Error("Not found");
      error.status = 404;
      throw error;
    }

    res.json({ message: "contact deleted" });
  } catch (err) {
    next(err);
  }
});

// 6. Обновить поле статуса favorite
router.patch("/:contactId/favorite", authenticate, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { favorite } = req.body;
    const { _id } = req.user;

    const updateContact = await Contact.findOneAndUpdate(
      { _id: contactId, owner: _id },
      { favorite },
      {
        new: true,
      }
    );
    if (!updateContact) {
      const error = new Error("Not found");
      error.status = 404;
      throw error;
    }

    res.json(updateContact);
  } catch (err) {
    if (err.message.includes("failed for value")) {
      err.status = 404;
    }
    next(err);
  }
});

module.exports = router;
