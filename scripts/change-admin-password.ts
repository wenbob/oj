import { hashPassword } from "../src/lib/password";
import { prisma } from "../src/lib/prisma";

async function main() {
  const [, , username, password] = process.argv;

  if (!username || !password) {
    console.error("用法：npx tsx scripts/change-admin-password.ts <用户名> <新密码>");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("新密码至少需要 8 位");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, role: true, username: true },
  });

  if (!user) {
    console.error(`用户不存在：${username}`);
    process.exit(1);
  }

  if (user.role !== "admin") {
    console.error(`用户 ${username} 不是管理员账号`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(password) },
  });

  console.log(`管理员 ${username} 的密码已更新`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "修改管理员密码失败");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
