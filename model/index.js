const { v4 } = require("uuid");
const fs = require("fs/promises");
const path = require("path");

const contactsPath = path.join(__dirname, "contacts.json");

/*
1. Получить все контакты. --> listContacts
2. Получить один контакт по id. --> getContactById
3. Добавить контакт в список. --> addContact
4. Обновить контакт по id. --> updateContact
5. Удалить контакт по id. --> removeContact

*/
const updateContacts = async (contacts) => {
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
};

const listContacts = async () => {
  const data = await fs.readFile(contactsPath);
  const contacts = JSON.parse(data);
  return contacts;
};

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  const contact = contacts.find(
    (item) => String(item.id) === String(contactId)
  );
  if (!contact) {
    return null;
  }
  return contact;
};

const addContact = async (body) => {
  // console.log(body);
  const { name, email, phone } = body;
  const newContact = { id: v4(), name, email, phone };
  const contacts = await listContacts();
  contacts.push(newContact);
  await updateContacts(contacts);
  return newContact;
};

const updateContact = async (contactId, body) => {
  const { name, email, phone } = body;
  const contacts = await listContacts();

  const idx = contacts.findIndex(
    (item) => String(item.id) === String(contactId)
  );
  if (idx === -1) {
    return null;
  }

  contacts[idx] = {
    ...contacts[idx],
    name,
    email,
    phone,
  };
  await updateContacts(contacts);
  return contacts[idx];
};

const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const idx = contacts.findIndex(
    (item) => String(item.id) === String(contactId)
  );
  if (idx === -1) {
    return null;
  }

  const removeContact = contacts.splice(idx, 1);
  await updateContacts(contacts);
  return removeContact;
};

module.exports = {
  listContacts,
  getContactById,
  updateContact,
  removeContact,
  addContact,
};
