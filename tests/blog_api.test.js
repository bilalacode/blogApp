const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const helper = require("./helper");
let token = "";
const jwt = require("jsonwebtoken");

//Before all empty the database for users and blogs.
//Generate and save a token

beforeAll(async () => {
  await helper.emptyDatabase();
});

describe("Testing user creation functionality", () => {
  test("A user can be created", async () => {
    const testUser = {
      username: "testuser",
      name: "testuser",
      password: "testuser",
    };
    const result = await api.post("/api/users").send(testUser);
    expect(result.body.name).toEqual("testuser");
  });

  test("A user with existing name cannot be created", async () => {
    const testUser = {
      username: "testuser",
      name: "testuser",
      password: "testuser",
    };
    const result = await api.post("/api/users").send(testUser);
    expect(result.status).toEqual(400);
  });

  test("A user with missing password cannot be created", async () => {
    const userWithMissingPassword = {
      username: "missigpassword",
      name: "missingpassword",
    };

    await api.post("/api/users").send(userWithMissingPassword).expect(400);
  });

  test("user cannot login with wrong credentials", async () => {
    const wrongUser = {
      username: "wronguser",
      password: "wronguser",
    };
    await api.post("/api/login").send(wrongUser).expect(401);
  });

  test("existing user but incorrect password creates an error", async () => {
    const wrongPassword = {
      username: "testuser",
      password: "wrongpassword",
    };

    await api.post("/api/login").send(wrongPassword).expect(401);
  });

  test("a user can login and generate token with correct credentials", async () => {
    const user = { username: "testuser", password: "testuser" };

    const result = await api.post("/api/login").send(user);

    expect(result.status).toEqual(200);
    expect(result.body.token).toBeDefined();

    token = result.body.token;
  });
});

describe("Testing blog CRUD functionality", () => {
  test("New blog can be created with correct token", async () => {
    for (blog of helper.initialBlogs) {
      await api
        .post("/api/blogs")
        .send(helper.initialBlogs[0])
        .set("Authorization", `Bearer ${token}`)
        .expect(201)
        .expect("Content-Type", /application\/json/);
    }
  });

  test("Blog cannot be added without credentials", async () => {
    await api.post("/api/blogs").send(helper.initialBlogs[0]).expect(401);
  });

  test("Blogs can be retrieved from the database", async () => {
    const result = await api.get("/api/blogs");
    expect(result.body).toHaveLength(helper.initialBlogs.length);
  });

  test("Non existing blog returns a 404 error", async () => {
    const id = await helper.nonExistingId();
    await api.get(`/api/blogs/${id.toString()}`).expect(404);
  });

  test("Correct user can update the blog", async () => {
    const blogs = await helper.blogsInDB();

    const updatedBlog = { ...blogs[0], content: "This blog has been updated" };

    await api
      .put(`/api/blogs/${blogs[0].id.toString()}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedBlog)
      .expect(200);
  });

  test("Correct user can delete the blog", async () => {
    const blogs = await helper.blogsInDB();
    await api
      .delete(`/api/blogs/${blogs[0].id.toString()}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
    const newblog = await helper.blogsInDB();
  });
});

describe("Testing commenting functionality", () => {
  let blogId;

  beforeAll(async () => {
    const blogs = await helper.blogsInDB();
    blogId = blogs[0].id;
  });

  test("A comment can be added to a blog", async () => {
    const comment = {
      content: "This is a test comment for the blog post.",
    };

    await api
      .post(`/api/blogs/${blogId}/comments`)
      .send(comment)
      .set("Authorization", `Bearer ${token}`)
      .expect(201);
  });

  test("A blog with comments can be retrieved", async () => {
    const result = await api.get(`/api/blogs/${blogId}`);
    expect(result.body.comments).toHaveLength(1);
  });
});

describe("Testing liking/unliking functionality", () => {
  let blogId;
  let userId;
  let response; 

  beforeAll(async () => {
    const blogs = await helper.blogsInDB();
    blogId = blogs[0].id;

    // Log in the user and obtain a token
    const user = { username: "testuser", password: "testuser" };
    const result = await api.post("/api/login").send(user);
    token = result.body.token;

    // Decode the token to get the user ID
    const decodedToken = jwt.verify(token, process.env.SECRET);
    userId = decodedToken.id;

    // Like the blog before testing
    response = await api
      .put(`/api/blogs/${blogId}/like`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
  });

  test("A blog can be liked", async () => {
    expect(
      response.body.likes.some((like) => like.user === userId)
    ).toBeTruthy();

    const updatedBlog = await api.get(`/api/blogs/${blogId}`);
    expect(
      updatedBlog.body.likes.some((like) => like.user === userId)
    ).toBeTruthy();
  });

  test("A blog can be unliked", async () => {
    response = await api
      .put(`/api/blogs/${blogId}/like`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(
      response.body.likes.some((like) => like.user === userId)
    ).toBeFalsy();

    const updatedBlog = await api.get(`/api/blogs/${blogId}`);
    expect(
      updatedBlog.body.likes.some((like) => like.user === userId)
    ).toBeFalsy();
  });
});

// Rest of the code...

afterAll(async () => {
  await mongoose.connection.close();
});
