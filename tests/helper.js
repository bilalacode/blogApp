const User = require("../models/user");
const Blog = require("../models/blog");
const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

const emptyDatabase = async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});
};

const initialBlogs = [
  {
    title: "First test blog",
    author: "Anon",
    url: "testurl.com",
    likes: 10,
    content: "This is first blog post test",
  },
  {
    title: "Second test blog",
    author: "Anon",
    url: "testurl.com",
    likes: 50,
    content: "This is first blog post test",
  },
];

const blogsInDB = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const nonExistingId = async () => {
  const blog = new Blog({...initialBlogs[0], user: new mongoose.Types.ObjectId()});
  await blog.save();
  const id = blog._id;

  await Blog.findByIdAndDelete(id);

  return id.toString();
};

module.exports = { emptyDatabase, initialBlogs, blogsInDB, nonExistingId };
