import {PrismaClient} from "@prisma/client";
import * as process from "process";
import {undefined} from "zod";

import bcrypt from "bcrypt";

const prisma = new PrismaClient()

async function main() {
    await prisma.user.create({
        data: {
            name: "Super Admin",
            email: "admin@utopia.com",
            password: await bcrypt.hash("admin", 10),
            role: "SUPER_ADMIN"
        }
    });
}

main()
.then(async () => {
    await prisma.$disconnect()
})
.catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
})