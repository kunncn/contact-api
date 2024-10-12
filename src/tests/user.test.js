const request = require("supertest");
const app = require("../index");
const { User } = require("../models");

describe("User API", () => {
  let token;
  let originalEmail = "testuser@example.com";
  let newEmail;

  beforeAll(async () => {
    // Register a user
    await request(app).post("/api/register").send({
      name: "Test User",
      email: originalEmail,
      password: "testpassword",
      password_confirmation: "testpassword",
    });

    // Log in to get the token
    const loginResponse = await request(app).post("/api/login").send({
      email: originalEmail,
      password: "testpassword",
    });

    token = loginResponse.body.token;
  });

  it("should edit account information", async () => {
    newEmail = `updateduser-${Date.now()}@example.com`;

    const response = await request(app)
      .put("/api/account/edit")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Test User",
        email: newEmail,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Account updated successfully"
    );
    expect(response.body.user).toHaveProperty("name", "Updated Test User");
    expect(response.body.user).toHaveProperty("email", newEmail);
  });

  afterAll(async () => {
    // Clean up the test data after all tests are done
    await User.deleteOne({ email: newEmail });
    await User.deleteOne({ email: originalEmail });
  });
});
