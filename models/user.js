const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Blog = require("../models/blog");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLength: 4,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    minLength: 4,
  },
  passwordHash: {
    type: String,
    required: true,
    minLength: 6,
  },
  blog: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
  ],
});

userSchema.set("toJSON", {
  transform: (document, object) => {
    object.id = object._id;
    delete object._id;
    delete object.__v;
    delete object.passwordHash;
  },
});

userSchema.plugin(uniqueValidator);

const User = mongoose.model("User", userSchema);

module.exports = User;
