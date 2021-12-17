const express = require("express");
const router = express.Router();
const Joi = require("joi");

/*
3. Добавить контакт в список. --> addContact
4. Обновить контакт по id. --> updateById
5. Удалить контакт по id. --> removeContact

*/

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
  const body = req.body;
  try {
    const { error } = joiSchema.validate(body);
    if (error) {
      error.status = 400;
      throw error;
    }
    const newContact = await contactsOperations.addContact(body);
    res.status(201).json(newContact);
  } catch (err) {
    next(err);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  res.json({ message: "template message" });
});

router.patch("/:contactId", async (req, res, next) => {
  res.json({ message: "template message" });
});

module.exports = router;
