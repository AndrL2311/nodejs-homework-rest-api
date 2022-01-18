const mongoose = require("mongoose");
const request = require("supertest");
require("dotenv").config();

const app = require("../../app");
const { User } = require("../../model/user");

const { DB_TEST_HOST } = process.env;

describe("test auth", () => {
  let server;
  beforeAll(() => (server = app.listen(3000)));
  afterAll(() => server.close());

  beforeEach((done) => {
    mongoose.connect(DB_TEST_HOST).then(() => done());
  });

  //!!!Удалет тестовую базу только если пользователь имеет права Atlas admin
  // afterEach((done) => {
  //   mongoose.connection.db.dropDatabase(() => {
  //     mongoose.connection.close(() => done());
  //   });
  // });

  // Удаляет колекцию "users" в тестовой базе для стандвртного пользователя
  //  с правами Read and write to any datbase
  afterEach((done) => {
    mongoose.connection.db.dropCollection("users").then(() => {
      mongoose.connection.close(() => done());
    });
  });

  test("test login route", async () => {
    // В пустую базу заносим нового пользователя
    const registerData = { password: "123567", email: "test@ukr.net" };
    const responseRegister = await request(app)
      .post("/api/users/signup")
      .send(registerData);

    expect(responseRegister.statusCode).toBe(201);

    // Проверка по домашнему заданию
    //1. ответ должен иметь статус-код 200
    //2. в ответе должен возвращаться токен
    //3. в ответе должен возвращаться объект user с 2 полями email и subscription, имеющие тип данных String

    const loginData = { password: "123567", email: "test@ukr.net" };
    const response = await request(app)
      .post("/api/users/login")
      .send(loginData);

    expect(response.statusCode).toBe(200);
    expect(typeof response.body.token).toBeTruthy();
    expect(typeof response.body.token).toBe("string");
    const user = await User.findOne(response.body.email);
    expect(user).toBeTruthy();
    expect(typeof user.email).toBe("string");
    expect(typeof user.subscription).toBe("string");
  });
});
