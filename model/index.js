const { v4 } = require("uuid");
const fs = require("fs/promises");
const path = require("path");

const contactsPath = path.join(__dirname, "contacts2.json");

/*
1. Получить все контакты. --> listContacts
2. Получить один контакт по id. --> getContactById
3. Добавить контакт в список. --> addContact
4. Обновить контакт по id. --> updateContact
5. Удалить контакт по id. --> removeContact

*/

const listContacts = async () => {
  const data = await fs.readFile(contactsPath);
  const contacts = JSON.parse(data);
  return contacts;
};

const getContactById = async (contactId) => {};

const removeContact = async (contactId) => {};

const addContact = async (body) => {};

const updateContact = async (contactId, body) => {};

module.exports = {
  listContacts,
  getContactById,
  updateContact,
  removeContact,
  addContact,
};
