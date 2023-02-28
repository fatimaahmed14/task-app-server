import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function seed() {
  const user = await createUser("test1@test.com", "password1", "fatima");

  process.exit(0);
}

async function createUser(email, password, name) {
  const user = await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 8),
      name,
    },
  });

  console.info("user created", user);

  return user;
}

seed().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
