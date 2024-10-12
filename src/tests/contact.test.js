const request = require("supertest");
const app = require("../index");
const { User, Contact } = require("../models");

describe("Contact API", () => {
  let token;
  let originalEmail;

  beforeAll(async () => {
    // Register a user
    const response = await request(app).post("/api/register").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "testpassword",
      password_confirmation: "testpassword",
    });

    originalEmail = response.body.email; // Fixed the reference here

    // Log in to get the token
    const loginResponse = await request(app).post("/api/login").send({
      email: "testuser@example.com",
      password: "testpassword",
    });

    token = loginResponse.body.token;
  });

  it("should create a new contact", async () => {
    const response = await request(app)
      .post("/api/contact")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Ko Ko",
        phone: "0912345678",
        email: "koko@gmail.com",
        address: "No.1 koko Str.",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.contact).toHaveProperty("_id");
  });

  it("should get all contacts", async () => {
    const response = await request(app)
      .get("/api/contact")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.contacts)).toBe(true);
  });

  it("should get a single contact", async () => {
    const contactResponse = await request(app)
      .post("/api/contact")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Contact",
        phone: "0912345678",
      });

    const contactId = contactResponse.body.contact._id;

    const response = await request(app)
      .get(`/api/contact/${contactId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.contact).toHaveProperty("_id", contactId); // Fixing reference to 'contact'
    expect(response.body.contact.name).toBe("Test Contact");
  });

  it("should update a contact", async () => {
    const contactResponse = await request(app)
      .post("/api/contact")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Update Test Contact",
        phone: "0912345678",
      });

    const contactId = contactResponse.body.contact._id;

    const response = await request(app)
      .put(`/api/contact/${contactId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Contact",
      });

    expect(response.status).toBe(200);
    expect(response.body.contact.name).toBe("Updated Contact");
  });

  it("should delete a contact", async () => {
    const contactResponse = await request(app)
      .post("/api/contact")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Delete Test Contact",
        phone: "0912345678",
      });

    const contactId = contactResponse.body.contact._id;

    const response = await request(app)
      .delete(`/api/contact/${contactId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  afterAll(async () => {
    // Clean up the test data after all tests are done
    await User.deleteOne({ email: originalEmail });
    await Contact.deleteMany({});
  });
});
