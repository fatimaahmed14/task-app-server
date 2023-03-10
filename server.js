const express = require("express");
const app = express();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(express.json());

// middleware
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// authentication
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

// create new user
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  // Hash password before storing in the database
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
  const token = jwt.sign({ userId: user.id }, "secret");
  res.json({ token });
});

// login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const token = jwt.sign({ userId: user.id }, "secret");
  res.json({ token });
});

// get users data
app.get("/user", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    // returning the user object
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// add task
app.post("/tasks", async (req, res) => {
  const { title, description, deadline, userId } = req.body;
  let user;

  if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
  }

  const createdTask = await prisma.task.create({
    data: {
      title,
      description,
      status: "incomplete",
      deadline,
      user: {
        connect: {
          id: userId,
        },
      },
    },
    include: {
      user: true,
    },
  });

  res.json(createdTask);
});

// delete task
app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  const taskToDelete = await prisma.task.delete({
    where: { id: Number(id) },
  });

  if (!taskToDelete) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(taskToDelete);
});

// complete task
app.patch("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  const taskToUpdate = await prisma.task.update({
    where: { id: Number(id) },
    data: { status: "complete" },
    include: { user: true },
  });

  if (!taskToUpdate) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(taskToUpdate);
});

// get all tasks for a user by their ID
app.get("/tasks/:id", async (req, res) => {
  const userId = Number(req.params.id);
  const tasks = await prisma.task.findMany({
    where: {
      userId: userId,
    },
  });
  res.json(tasks);
});

// middleware to handle errors
app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

// Start the server
app.listen(4000, () => {
  console.log("Server started on port 4000");
});

// should I add auth to my task reqs?
