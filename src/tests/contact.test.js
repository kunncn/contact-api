const request = require("supertest");
const app = require("../index"); // Make sure to export your Express app from index.js
const { User, Contact } = require("../models"); // Adjust path as necessary

jest.setTimeout(10000); // Increase the timeout to 10 seconds globally

describe("Contact API", () => {
  let token;

  // Before all tests, register a user and log in to get a token
  beforeAll(async () => {
    jest.setTimeout(10000); // Increase the timeout to 10 seconds

    console.log("Registering a test user...");
    // Register a user
    await request(app).post("/api/register").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "testpassword",
      password_confirmation: "testpassword",
    });

    console.log("Logging in to get a token...");
    // Log in to get the token
    const response = await request(app).post("/api/login").send({
      email: "testuser@example.com",
      password: "testpassword",
    });

    token = response.body.token; // Store the token for later tests
    console.log("Token received:", token);
  });

  afterAll(async () => {
    // Clean up the test data after all tests are done
    console.log("Cleaning up test data...");
    await User.deleteOne({ email: "testuser@example.com" });
    await Contact.deleteMany({}); // Clean up contacts if needed
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
    expect(response.body).toHaveProperty("_id");
    expect(response.body.name).toBe("Ko Ko");
  });

  it("should get all contacts", async () => {
    const response = await request(app)
      .get("/api/contact")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0); // Check if at least one contact exists
  });

  it("should get a single contact", async () => {
    // Create a contact first
    const contactResponse = await request(app)
      .post("/api/contact")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Contact",
        phone: "0912345678",
      });

    const contactId = contactResponse.body._id;

    const response = await request(app)
      .get(`/api/contact/${contactId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id", contactId);
    expect(response.body.name).toBe("Test Contact");
  });

  it("should update a contact", async () => {
    // Create a contact first
    const contactResponse = await request(app)
      .post("/api/contact")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Update Test Contact",
        phone: "0912345678",
      });

    const contactId = contactResponse.body._id;

    const response = await request(app)
      .put(`/api/contact/${contactId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Contact",
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Updated Contact");
  });

  it("should delete a contact", async () => {
    // Create a contact first
    const contactResponse = await request(app)
      .post("/api/contact")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Delete Test Contact",
        phone: "0912345678",
      });

    const contactId = contactResponse.body._id;

    const response = await request(app)
      .delete(`/api/contact/${contactId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  // New test for editing account information
  // New test for editing account information
  it("should edit account information", async () => {
    const newEmail = `updateduser-${Date.now()}@example.com`; // Ensure the email is unique

    const response = await request(app)
      .put("/api/account/edit")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Test User",
        email: newEmail, // Use the unique email
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Account updated successfully"
    ); // Check for success message
    expect(response.body.user).toHaveProperty("name", "Updated Test User"); // Check the name in the user object
    expect(response.body.user).toHaveProperty("email", newEmail); // Check the email in the user object
  });
});
