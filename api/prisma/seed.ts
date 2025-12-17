import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        name: 'John Doe',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob.wilson@example.com',
        name: 'Bob Wilson',
      },
    }),
    prisma.user.create({
      data: {
        email: 'alice.johnson@example.com',
        name: 'Alice Johnson',
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie.brown@example.com',
        name: 'Charlie Brown',
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'MacBook Pro 16"',
        description: 'Apple M3 Pro chip, 18GB RAM, 512GB SSD',
        price: 2499.99,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Sony WH-1000XM5',
        description: 'Industry-leading noise canceling wireless headphones',
        price: 399.99,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Ergonomic Office Chair',
        description: 'Adjustable lumbar support, mesh back, armrests',
        price: 549.99,
        category: 'Furniture',
        imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Standing Desk Electric',
        description: '60x30 inches, programmable heights, cable management',
        price: 699.99,
        category: 'Furniture',
        imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Mechanical Keyboard',
        description: 'Cherry MX Brown switches, RGB backlight, full-size',
        price: 149.99,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Ultra-wide Monitor 34"',
        description: '3440x1440 resolution, 144Hz, curved display',
        price: 799.99,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Mouse',
        description: 'Ergonomic design, 4000 DPI, silent clicks',
        price: 79.99,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Desk Lamp LED',
        description: 'Adjustable brightness, color temperature, USB charging',
        price: 89.99,
        category: 'Furniture',
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c',
      },
    }),
  ]);

  console.log(`Created ${products.length} products`);

  // Create Reviews
  const reviews = await Promise.all([
    // MacBook Pro reviews
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Best laptop I have ever owned. The M3 chip is incredibly fast!',
        userId: users[0].id,
        productId: products[0].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Great performance but a bit pricey. Worth it for professionals.',
        userId: users[1].id,
        productId: products[0].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'The display is stunning and battery life is amazing.',
        userId: users[2].id,
        productId: products[0].id,
      },
    }),

    // Sony Headphones reviews
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Noise cancellation is top notch. Perfect for flights.',
        userId: users[0].id,
        productId: products[1].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Very comfortable for long listening sessions.',
        userId: users[3].id,
        productId: products[1].id,
      },
    }),

    // Office Chair reviews
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Good support but assembly was a bit tricky.',
        userId: users[1].id,
        productId: products[2].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'My back pain is gone after switching to this chair!',
        userId: users[4].id,
        productId: products[2].id,
      },
    }),

    // Standing Desk reviews
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Smooth height adjustment, very sturdy.',
        userId: users[2].id,
        productId: products[3].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Great desk but shipping took forever.',
        userId: users[0].id,
        productId: products[3].id,
      },
    }),

    // Keyboard reviews
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Tactile feedback is perfect. Love the build quality.',
        userId: users[3].id,
        productId: products[4].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Cherry MX Browns are great for typing and gaming.',
        userId: users[1].id,
        productId: products[4].id,
      },
    }),

    // Monitor reviews
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Productivity boost with all that screen real estate!',
        userId: users[4].id,
        productId: products[5].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Gaming on this monitor is an experience. Love the curve.',
        userId: users[2].id,
        productId: products[5].id,
      },
    }),

    // Mouse reviews
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Very comfortable, battery lasts weeks.',
        userId: users[0].id,
        productId: products[6].id,
      },
    }),

    // Desk Lamp reviews
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'USB charging port is super handy.',
        userId: users[3].id,
        productId: products[7].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 3,
        comment: 'Good lamp but brightness could be higher.',
        userId: users[4].id,
        productId: products[7].id,
      },
    }),
  ]);

  console.log(`Created ${reviews.length} reviews`);
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
