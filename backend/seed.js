const mongoose = require('mongoose');
const Order = require('./models/order');
const Product = require('./models/Product');
const User = require('./models/user'); 
require('dotenv').config();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/kikoDB')
    .then(() => console.log('MongoDB Connected to Seeder'))
    .catch(err => console.log('Database connection error:', err));

const seedOrders = async () => {
    try {
        // 1. Wipe out any old test orders to start fresh
        await Order.deleteMany();
        console.log('🧹 Old orders cleared!');

        // 2. Fetch existing products and users to attach to the orders
        const products = await Product.find();
        const users = await User.find();

        if (products.length === 0 || users.length === 0) {
            console.log('❌ Error: You need at least one product and one user in the database to create orders.');
            process.exit(1);
        }

        const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
        const fakeOrders = [];

        // 3. Generate 12 random orders
        for (let i = 0; i < 12; i++) {
            // Pick a random user
            const randomUser = users[Math.floor(Math.random() * users.length)];

            // Create 1 to 3 random items for this specific order
            const numItems = Math.floor(Math.random() * 3) + 1;
            const items = [];
            let totalAmount = 0;

            for (let j = 0; j < numItems; j++) {
                const randomProduct = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
                const price = randomProduct.price;

                items.push({
                    product: randomProduct._id,
                    quantity: quantity,
                    price: price
                });

                totalAmount += (price * quantity);
            }

            // Trick the database into thinking these orders happened over the last 14 days
            // This makes the "Recent Transactions" table look much more realistic!
            const randomDaysAgo = Math.floor(Math.random() * 14);
            const fakeDate = new Date();
            fakeDate.setDate(fakeDate.getDate() - randomDaysAgo);

            fakeOrders.push({
                customer: randomUser._id,
                items: items,
                totalAmount: totalAmount,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                createdAt: fakeDate, 
                updatedAt: fakeDate
            });
        }

        // 4. Save to Database
        await Order.insertMany(fakeOrders);
        console.log('✅ 12 Fake Orders successfully injected into the database!');
        
        // 5. Close connection
        process.exit();

    } catch (error) {
        console.error('❌ Error seeding orders:', error);
        process.exit(1);
    }
};

// Run the function
seedOrders();