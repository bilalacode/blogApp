const blogsRouter = require("express").Router();
const mongoose = require("mongoose");
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();
require("express-async-errors");

// Get all blogs with user and comment details
blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({})
    .populate("user", { username: 1, name: 1 })
    .populate({
      path: "comments.user",
      select: "username name",
      model: "User",
    });
  return response.status(200).json(blogs);
});

// Create a new blog
blogsRouter.post("/", async (request, response) => {
  const dedicatedToken = jwt.verify(request.token, process.env.SECRET);
  const user = await User.findById(dedicatedToken.id);
  if (!user) return response.status(401).json({ error: "invalid token" });

  const { content, title } = request.body;
  const blog = new Blog({
    author: user.name,
    content,
    metaDescription: content.slice(0, 149) + "...",
    title,
    user: user.id,
  });

  user.blog = user.blog.concat(blog.id);
  await user.save();
  const result = await blog.save();
  return response.status(201).json(result);
});

blogsRouter.put("/:id/like", async (request, response) => {
  const dedicatedToken = jwt.verify(request.token, process.env.SECRET);
  const user = await User.findById(dedicatedToken.id);
  if (!user) return response.status(401).json({ error: "invalid token" });

  const blog = await Blog.findById(request.params.id);
  if (!blog) return response.status(404).json({ error: "blog not found" });

  const hasLiked = blog.likes.some(like => like.user.toString() === user.id.toString());
  if (hasLiked) {
    // Remove the like
    blog.likes = blog.likes.filter(like => like.user.toString() !== user.id.toString());
  } else {
    // Add the like
    blog.likes.push({ user: user.id });
  }
  await blog.save();
  return response.status(200).json(blog);
});



// Delete a blog
blogsRouter.delete("/:id", async (request, response) => {
  const dedicatedToken = jwt.verify(request.token, process.env.SECRET);
  const user = await User.findById(dedicatedToken.id);
  if (!user) return response.status(401).json({ error: "invalid token" });

  const blog = await Blog.findById(request.params.id);
  if (!blog) return response.status(404).json({ error: "blog not found" });
  if (blog.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: "unauthorized deletion" });
  }

  await Blog.findByIdAndRemove(request.params.id);
  user.blog = user.blog.filter((blogId) => blogId.toString() !== request.params.id);
  await user.save();
  return response.status(204).end();
});

// Get a specific blog by ID
blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id)
    .populate("user", { username: 1, name: 1 })
    .populate({
      path: "comments.user",
      select: "username name",
      model: "User",
    });
  if (!blog) return response.status(404).json({ error: "Blog not found" });
  return response.status(200).json(blog);
});

// Update a blog
blogsRouter.put("/:id", async (request, response) => {
  const dedicatedToken = jwt.verify(request.token, process.env.SECRET);
  const user = await User.findById(dedicatedToken.id);
  if (!user) return response.status(401).json({ error: "invalid token" });

  const blog = await Blog.findById(request.params.id);
  if (!blog) return response.status(404).json({ error: "blog not found" });
  if (blog.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: "unauthorized edit" });
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { title: request.body.title, content: request.body.content },
    { new: true }
  );
  return response.status(200).json(updatedBlog);
});

// Add a comment to a blog
blogsRouter.post("/:id/comments", async (request, response) => {
  const dedicatedToken = jwt.verify(request.token, process.env.SECRET);
  const user = await User.findById(dedicatedToken.id);
  if (!user) return response.status(401).json({ error: "invalid token" });

  const blog = await Blog.findById(request.params.id);
  if (!blog) return response.status(404).json({ error: "blog not found" });

  const comment = { content: request.body.content, user: user.id };
  blog.comments.push(comment);
  await blog.save();
  return response.status(201).json(comment);
});

module.exports = blogsRouter;
