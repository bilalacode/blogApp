const userRouter = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
require("express-async-errors");

userRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

  if (!username || !name || !password) {
    return response
      .status(400)
      .json({ error: "missing either username, password, or name." });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const result = await user.save();

  return response.status(201).json(result);
});

userRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blog");
  return response.status(200).json(users);
});

userRouter.get("/:id", async (request, response) => {
  const id = request.params.id;
  const user = await User.findById(id).populate("blog");
  return response.status(200).json(user);
});

module.exports = userRouter;
