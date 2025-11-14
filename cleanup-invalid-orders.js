// Cleanup script to remove invalid orders from MongoDB
// Run this with: node cleanup-invalid-orders.js

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

async function cleanupInvalidOrders() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find orders with null or missing trackerId
        const invalidOrders = await Order.find({
            $or: [
                { trackerId: null },
                { trackerId: { $exists: false } },
                { trackerId: '' }
            ]
        });

        console.log(`Found ${invalidOrders.length} invalid orders`);

        if (invalidOrders.length > 0) {
            // Delete invalid orders
            const result = await Order.deleteMany({
                $or: [
                    { trackerId: null },
                    { trackerId: { $exists: false } },
                    { trackerId: '' }
                ]
            });

            console.log(`✅ Deleted ${result.deletedCount} invalid orders`);
        } else {
            console.log('✅ No invalid orders found');
        }

        // Show remaining orders
        const remainingOrders = await Order.find({});
        console.log(`\nRemaining orders: ${remainingOrders.length}`);
        
        if (remainingOrders.length > 0) {
            console.log('\nValid orders:');
            remainingOrders.forEach(order => {
                console.log(`  - ${order.trackerId} | ${order.userEmail} | R ${order.total}`);
            });
        }

        // Close connection
        await mongoose.connection.close();
        console.log('\n✅ Cleanup complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Run cleanup
cleanupInvalidOrders();
