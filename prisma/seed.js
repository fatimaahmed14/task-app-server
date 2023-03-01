import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function createUser() {
  return prisma.user.create({
    data: {
      email: "example@example.com",
      password: "password123",
      name: "fatima",
    },
  });
}

async function main() {
  await createUser();
  console.log("User created", createUser);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
