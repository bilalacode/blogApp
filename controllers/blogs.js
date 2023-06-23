const blogsRouter = require("express").Router();
const mongoose = require("mongoose");
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();
require("express-async-errors");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  return response.status(200).json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const dedicatedToken = jwt.verify(request.token, process.env.SECRET);
  const user = await User.findById(dedicatedToken.id);

  if (!user) {
    return response.status(401).json({ error: "invalid token" });
  }
  const { author, content, likes, url, title } = request.body;

  const blog = new Blog({ author, content, likes, url, title, user: user.id });
  user.blogs = user.blogs.concat(blog.id);
  await user.save();
  const result = await blog.save();

  return response.status(201).json(result);
});

blogsRouter.delete("/:id", async (request, response) => {
  const dedicatedToken = jwt.verify(request.token, process.env.SECRET);
  const user = await User.findById(dedicatedToken.id);

  if (!user) {
    return response.status(401).json({ error: "invalid token" });
  }

  const blog = await Blog.findById(request.params.id);

  if (!blog) {
    return response.status(404).json({ error: "blog not found" });
  }

  if (blog.user.toString() !== user.id.toString()) {
    return response
      .status(401)
      .json({ error: "only user who created the blog can delete it" });
  }

  await Blog.findByIdAndRemove(request.params.id);

  user.blogs = user.blogs.filter(
    (blog) => blog.id.toString() !== request.params.id
  );
  await user.save();

  return response.status(204).end();
});

blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  if (!blog) {
    return response.status(404).json({ error: "Blog not found" });
  }

  return response.status(200).json(blog);
});

blogsRouter.put("/:id", async (request, response) => {
  const dedicatedToken = jwt.verify(request.token, process.env.SECRET);
  const user = await User.findById(dedicatedToken.id);

  if (!user) {
    return response.status(401).json({ error: "invalid token" });
  }

  const blog = await Blog.findById(request.params.id);

  if (!blog) {
    return response.status(404).json({ error: "blog not found" });
  }

  if (blog.user.toString() !== user.id.toString()) {
    return response
      .status(401)
      .json({ error: "only user who created the blog can edit it" });
  }

  const { title, author, url, likes, content } = request.body;
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { title, author, url, likes, content },
    { new: true }
  );
  return response.status(200).json(updatedBlog);
});

module.exports = blogsRouter;
