const request = require("supertest");
const app = require("../index");
const { User } = require("../models");

describe("User API", () => {
  let token;
  let originalEmail;

  beforeAll(async () => {
    jest.setTimeout(10000);

    // Register a user
    const response = await request(app).post("/api/register").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "testpassword",
      password_confirmation: "testpassword",
    });

    originalEmail = response.body.email;

    // Log in to get the token
    const loginResponse = await request(app).post("/api/login").send({
      email: "testuser@example.com",
      password: "testpassword",
    });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up the test data after all tests are done
    await User.deleteOne({ email: originalEmail });
  });

  it("should edit account information", async () => {
    const newEmail = `updateduser-${Date.now()}@example.com`;
    originalEmail = newEmail;

    const response = await request(app)
      .put("/api/account/edit")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Test User",
        email: originalEmail,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Account updated successfully"
    );
    expect(response.body.user).toHaveProperty("name", "Updated Test User");
    expect(response.body.user).toHaveProperty("email", newEmail);
  });

  it("should revert to original account information", async () => {
    const response = await request(app)
      .put("/api/account/edit")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test User",
        email: originalEmail,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Account updated successfully"
    );
    expect(response.body.user).toHaveProperty("name", "Test User");
    expect(response.body.user).toHaveProperty("email", originalEmail);
  });
});
