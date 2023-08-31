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
  },
  comments: [
    {
      content: String,
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],

  likes: [
    {user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }}
  ],
  content: {
    type: String,
    required: true,
    minLength: 500,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

blogSchema.set("toJSON", {
  transform: (document, object) => {
    // Transform _id for the main blog document
    object.id = object._id;
    
    // Transform _id for each comment
    object.comments.forEach(comment => {
      comment.id = comment._id;
      delete comment._id;
    });

    // Transform _id for each like
    object.likes.forEach(like => {
      like.id = like._id;
      delete like._id;
    });

    // Delete the original _id and __v fields
    delete object._id;
    delete object.__v;
  },
});


const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
