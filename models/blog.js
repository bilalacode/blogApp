const mongoose = require("mongoose");
const User = require("../models/user");

const blogSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  metaDescription: {
    type: String,
    required: true
  }
  ,
  likes: {
    type: Number,
    default: 0
  },
  content: {
    type: String,
    required: true,
    minLength: 500
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

blogSchema.set("toJSON", {
  transform: (document, object) => {
    object.id = object._id;
    delete object._id;
    delete object.__v;
  },
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
