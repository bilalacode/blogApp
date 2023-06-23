const logger = require("./logger");
const requestLogger = (request, response, next) => {
  logger.info("Method:", request.method);
  logger.info("URL:", request.url);
  logger.info("Body:", request.body);
  next();
};

const tokenExtractor = (request, response, next) => {
  let token = null;
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    token = authorization.replace("Bearer ", "");
  }

  // console.log(token);
  request.token = token;
  next();
};

const errorMiddleware = (error, request, response, next) => {
  logger.error("Error:", error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({
      error: "invalid token",
    });
  } else if (error.name === "TokenExpiredError") {
    return response.status(401).json({
      error: "token expired",
    });
  }

  next(error);
};

const unknownEndpointMiddleware = (request, response) => {
  response.status(404).json({ error: "Unknown endpoint" });
};

module.exports = {
  requestLogger,
  errorMiddleware,
  unknownEndpointMiddleware,
  tokenExtractor,
};
