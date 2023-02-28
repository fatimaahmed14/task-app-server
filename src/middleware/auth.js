import { sendDataResponse, sendMessageResponse } from "../utils/responses.js";
import { JWT_SECRET } from "../utils/config.js";
import jwt from "jsonwebtoken";
import User from "../domain/user.js";

export async function validateAuthentication(req, res, next) {
  const header = req.header("authorization");

  if (!header) {
    return sendDataResponse(res, 401, {
      authorization: "Missing Authorization header",
    });
  }

  const [type, token] = header.split(" ");

  const isTypeValid = validateTokenType(type);
  if (!isTypeValid) {
    return sendDataResponse(res, 401, {
      authentication: `Invalid token type, expected Bearer but got ${type}`,
    });
  }

  const isTokenValid = validateToken(token);
  if (!isTokenValid) {
    return sendDataResponse(res, 401, {
      authentication: "Invalid or missing access token",
    });
  }

  const decodedToken = jwt.decode(token);
  const foundUser = await User.findById(decodedToken.userId);
  delete foundUser.passwordHash;

  req.user = foundUser;

  next();
}

function validateToken(token) {
  if (!token) {
    return false;
  }

  return jwt.verify(token, JWT_SECRET, (error) => {
    return !error;
  });
}

function validateTokenType(type) {
  if (!type) {
    return false;
  }

  if (type.toUpperCase() !== "BEARER") {
    return false;
  }

  return true;
}
