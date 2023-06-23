const loginRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
require("express-async-errors");

loginRouter.post("/", async (request, response) => {
  const { username, password } = request.body;

  const user = await User.findOne({ username });

  if (!user) {
    return response.status(401).json({ error: "user does not exist"});
  }

  const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return response
      .status(401)
      .json({ error: "invalid username/password combination" });
  }

  const userToSend = { id: user._id, username: user.username };
  const token = jwt.sign(userToSend, process.env.SECRET, {
    expiresIn: 60 * 60,
  });

  return response
    .status(200)
    .send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
