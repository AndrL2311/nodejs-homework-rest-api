const express = require("express");
const router = express.Router();

/*

2. Получить один контакт по id. --> getContactById
3. Добавить контакт в список. --> addContact
4. Обновить контакт по id. --> updateById
5. Удалить контакт по id. --> removeContact

*/

const contactsOperations = require("../../model");

// 1. Получить все контакты.
router.get("/", async (req, res, next) => {
  try {
    const contacts = await contactsOperations.listContacts();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:contactId", async (req, res, next) => {
  res.json({ message: "template message" });
});

router.post("/", async (req, res, next) => {
  res.json({ message: "template message" });
});

router.delete("/:contactId", async (req, res, next) => {
  res.json({ message: "template message" });
});

router.patch("/:contactId", async (req, res, next) => {
  res.json({ message: "template message" });
});

module.exports = router;
