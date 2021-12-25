const express = require("express");
const router = express.Router();

const { Contact, joiSchema } = require("../../model");

// 1. Получить все контакты.
router.get("/", async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (err) {
    next(err);
  }
});

// 2. Получить один контакт по id.
router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await Contact.findById(contactId);
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
router.post("/", async (req, res, next) => {
  // const body = req.body;
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      error.status = 400;
      throw error;
    }
    const newContact = await Contact.create(req.body);
    res.status(201).json(newContact);
  } catch (err) {
    if (err.message.includes("validation failed")) {
      err.status = 404;
    }
    next(err);
  }
});

// 4. Обновить контакт по id.
router.put("/:contactId", async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      error.status = 400;
      throw error;
    }
    const { contactId } = req.params;

    const updateContact = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });
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
router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const deleteContact = await Contact.findByIdAndRemove(contactId);

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
router.patch("/:contactId/favorite", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { favorite } = req.body;

    const updateContact = await Contact.findByIdAndUpdate(
      contactId,
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
