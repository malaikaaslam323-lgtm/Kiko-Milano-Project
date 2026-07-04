const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Make sure this path points to your User model

// Connect to your database
mongoose.connect('mongodb://127.0.0.1:27017/kikoDB')
    .then(async () => {
        console.log('Connected to Database. Checking for Admin...');

        // 1. Check if an admin already exists so we don't accidentally make two
        const adminExists = await User.findOne({ email: 'admin@kikomilano.com' });
        if (adminExists) {
            console.log('Admin already exists! You can log in right now.');
            process.exit(); // Closes the script
        }

        // 2. Scramble the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // 3. Create the VIP Admin Account
        const adminUser = new User({
            name: 'Admin',
            email: 'admin@kikomilano.com',
            password: hashedPassword,
            role: 'admin' // The magic word that grants access
        });

        // 4. Save to database
        await adminUser.save();
        console.log('SUCCESS! Admin account created. Email: admin@kikomilano.com | Password: admin123');
        process.exit(); // Closes the script
    })
    .catch(err => {
        console.log('Error:', err);
        process.exit();
    });