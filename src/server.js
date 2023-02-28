const express = require("express");
const app = express();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

app.use(express.json());

// middleware
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Missing authentication token" });
  }
  try {
    const decoded = jwt.verify(token, "secret");
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid authentication token" });
  }
}

// craete new user
app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
    },
  });
  res.json(user);
});

// login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const token = jwt.sign({ userId: user.id }, "secret");
  res.json({ token });
});
