const express = require("express");
const router = express.Router();
const Joi = require("joi");

const contactsOperations = require("../../model");

const joiSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
});

// 1. Получить все контакты.
router.get("/", async (req, res, next) => {
  try {
    const contacts = await contactsOperations.listContacts();
    res.json(contacts);
  } catch (err) {
    next(err);
  }
});

// 2. Получить один контакт по id.
router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await contactsOperations.getContactById(contactId);
    if (!contact) {
      const error = new Error("Not found");
      error.status = 404;
      throw error;
    }
    res.json(contact);
  } catch (err) {
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
    const newContact = await contactsOperations.addContact(req.body);
    res.status(201).json(newContact);
  } catch (err) {
    next(err);
  }
});

// 4. Обновить контакт по id.
router.put("/:contactId", async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      // const error = new Error("missing fields");
      error.status = 400;
      throw error;
    }
    const { contactId } = req.params;
    // console.log(contactId);
    const updateContact = await contactsOperations.updateContact(
      contactId,
      req.body
    );
    if (!updateContact) {
      const error = new Error("Not found");
      error.status = 404;
      throw error;
    }

    res.json(updateContact);
  } catch (err) {
    next(err);
  }
});

// 5. Удалить контакт по id.
router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const deleteContact = await contactsOperations.removeContact(contactId);
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

module.exports = router;
