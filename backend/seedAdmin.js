const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user'); // Case-sensitivity fix

async function seedAdmin() {
    // 1. Check if an admin already exists
    const adminExists = await User.findOne({ email: 'admin@kikomilano.com' });
    if (adminExists) {
        return { success: true, message: 'Admin already exists in database.' };
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // 3. Create and save the admin
    const adminUser = new User({
        name: 'Admin',
        email: 'admin@kikomilano.com',
        password: hashedPassword,
        role: 'admin'
    });

    await adminUser.save();
    return { success: true, message: 'Admin account created successfully! Email: admin@kikomilano.com | Password: admin123' };
}

if (require.main === module) {
    require('dotenv').config();
    mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kikoDB')
        .then(async () => {
            console.log('Connected to Database. Checking/Seeding Admin...');
            const result = await seedAdmin();
            console.log(result.message);
            process.exit(0);
        })
        .catch(err => {
            console.error('Error:', err);
            process.exit(1);
        });
}

module.exports = { seedAdmin };