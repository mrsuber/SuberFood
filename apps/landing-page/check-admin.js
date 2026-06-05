const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if admin user exists
    const user = await prisma.user.findUnique({
      where: { email: 'admin@suberfoods.com' },
      select: {
        id: true,
        email: true,
        role: true,
        password: true,
        status: true
      }
    });

    if (user) {
      console.log('✓ User found:');
      console.log('  Email:', user.email);
      console.log('  Role:', user.role);
      console.log('  Status:', user.status);
      console.log('  Has password:', !!user.password);

      // If password exists, offer to reset it
      if (process.argv[2] === '--reset') {
        const newPassword = 'admin123'; // Default password
        const hashedPassword = await hash(newPassword, 10);

        await prisma.user.update({
          where: { email: 'admin@suberfoods.com' },
          data: { password: hashedPassword }
        });

        console.log('\n✓ Password reset successfully!');
        console.log('  New password:', newPassword);
      } else {
        console.log('\nTo reset password, run: node check-admin.js --reset');
      }
    } else {
      console.log('✗ No user found with email admin@suberfoods.com');
      console.log('\nCreating admin user...');

      const newPassword = 'admin123';
      const hashedPassword = await hash(newPassword, 10);

      const newUser = await prisma.user.create({
        data: {
          email: 'admin@suberfoods.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          emailVerified: new Date()
        }
      });

      console.log('✓ Admin user created successfully!');
      console.log('  Email:', newUser.email);
      console.log('  Password:', newPassword);
      console.log('  Role:', newUser.role);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
