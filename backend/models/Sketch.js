import mongoose from 'mongoose';

const sketchSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    images: [{
        type: String, // URLs to images
        required: true
    }],
    category: {
        type: String,
        required: true,
        enum: ['God Sketches', 'Portraits', 'Custom Sketches', 'Mobile Cover Sketch', 'Other']
    },
    size: {
        type: String,
        required: true,
        default: 'A4'
    },
    medium: {
        type: String,
        required: true,
        default: 'Graphite & Charcoal'
    },
    isDigitalDownload: {
        type: Boolean,
        default: false
    },
    tagline: {
        type: String,
        required: false
    }
}, { timestamps: true });

export default mongoose.model('Sketch', sketchSchema);
