import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import Sketch from './models/Sketch.js';
import Order from './models/Order.js';
import sketches from './data/sketches.js';

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Order.deleteMany();
        await Sketch.deleteMany();

        const sampleSketches = sketches.map(sketch => {
            return { ...sketch, artist: 'Admin Artist' };
        });

        await Sketch.insertMany(sampleSketches);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Order.deleteMany();
        await Sketch.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
