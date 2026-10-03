const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with assessment compliant data...');

  // Clear existing records in correct foreign key order
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  // Helper to hash passwords
  const salt = await bcrypt.genSalt(10);
  const hash = async (pwd) => bcrypt.hash(pwd, salt);

  // 1. Create System Administrator
  // Name length: 27 characters (Complies with 20-60 characters rule)
  // Password: Admin@123# (Complies with 8-16 chars, 1 uppercase, 1 special char)
  const adminPassword = await hash('Admin@123#');
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Administrator Officer',
      email: 'admin@example.com',
      password: adminPassword,
      address: '100 Central Administrative Plaza, Suite 900, New York, NY 10001',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created: admin@example.com / Admin@123#');

  // 2. Create Store Owners
  // Name length: 29 characters each
  const ownerPassword1 = await hash('Owner@123#');
  const owner1 = await prisma.user.create({
    data: {
      name: 'Alexander Benjamin Montgomery',
      email: 'owner1@example.com',
      password: ownerPassword1,
      address: '450 Silicon Boulevard, Tech Innovation Park, San Francisco, CA 94105',
      role: 'STORE_OWNER',
    },
  });

  const ownerPassword2 = await hash('Owner@456#');
  const owner2 = await prisma.user.create({
    data: {
      name: 'Victoria Charlotte Kensington',
      email: 'owner2@example.com',
      password: ownerPassword2,
      address: '789 Artisan Avenue, Historic Market Quarter, Boston, MA 02108',
      role: 'STORE_OWNER',
    },
  });
  console.log('✅ Store owners created: owner1@example.com, owner2@example.com');

  // 3. Create Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Apex Electronics & Gadgets Hub',
      email: 'contact@apexelectronics.com',
      address: '450 Silicon Boulevard, Building A, San Francisco, CA 94105',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'The Artisan Organic Bakehouse',
      email: 'info@artisanbakehouse.com',
      address: '789 Artisan Avenue, Historic Quarter, Boston, MA 02108',
      ownerId: owner2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Pioneer Books & Coffee Corner',
      email: 'hello@pioneerbooks.com',
      address: '320 Magnolia Terrace, Lakeview District, Austin, TX 78701',
      ownerId: null, // Ready for Admin assignment
    },
  });
  console.log('✅ Registered stores created.');

  // 4. Create Normal Users
  // Names: 27-28 characters (Complies with 20-60 characters rule)
  const userPassword1 = await hash('User@123#');
  const user1 = await prisma.user.create({
    data: {
      name: 'Jonathan Edward Bartholomew',
      email: 'user1@example.com',
      password: userPassword1,
      address: '550 Evergreen Ridge, Pinecrest Valley, Seattle, WA 98101',
      role: 'NORMAL_USER',
    },
  });

  const userPassword2 = await hash('User@456#');
  const user2 = await prisma.user.create({
    data: {
      name: 'Eleanor Beatrice Fitzpatrick',
      email: 'user2@example.com',
      password: userPassword2,
      address: '880 Sunset Horizon Way, Pacific Palisades, Los Angeles, CA 90272',
      role: 'NORMAL_USER',
    },
  });

  const userPassword3 = await hash('User@789#');
  const user3 = await prisma.user.create({
    data: {
      name: 'Dominic Augustine Richardson',
      email: 'user3@example.com',
      password: userPassword3,
      address: '210 Riverfront Promenade, Downtown District, Chicago, IL 60601',
      role: 'NORMAL_USER',
    },
  });
  console.log('✅ Normal users created: user1@example.com, user2@example.com, user3@example.com');

  // 5. Submit sample Ratings
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store1.id, rating: 5 },
      { userId: user2.id, storeId: store1.id, rating: 4 },
      { userId: user3.id, storeId: store1.id, rating: 4 },
      { userId: user1.id, storeId: store2.id, rating: 5 },
      { userId: user2.id, storeId: store2.id, rating: 5 },
      { userId: user3.id, storeId: store3.id, rating: 4 },
    ],
  });
  console.log('✅ Sample ratings submitted.');
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
