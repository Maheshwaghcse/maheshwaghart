import Sketch from '../models/Sketch.js';

// ── Simple in-memory cache (avoids hitting MongoDB on every page load) ──
const cache = {
    sketches: null,
    timestamp: 0,
    TTL: 2 * 60 * 1000, // 2 minutes
};
const invalidateCache = () => { cache.sketches = null; cache.timestamp = 0; };

// @desc    Fetch all sketches
// @route   GET /api/sketches
// @access  Public
const getSketches = async (req, res) => {
    try {
        const keyword = req.query.keyword;

        // Skip cache if filtering by keyword
        if (!keyword) {
            const now = Date.now();
            if (cache.sketches && (now - cache.timestamp) < cache.TTL) {
                // Cache hit — respond instantly, no DB call
                res.setHeader('X-Cache', 'HIT');
                return res.json(cache.sketches);
            }
        }

        const query = keyword
            ? { title: { $regex: keyword, $options: 'i' } }
            : {};

        // .lean() returns plain JS objects (~3x faster than Mongoose documents)
        // Field projection: only fetch what the frontend needs
        const sketches = await Sketch.find(query)
            .lean();

        if (!keyword) {
            cache.sketches = sketches;
            cache.timestamp = Date.now();
        }

        res.setHeader('X-Cache', 'MISS');
        res.json(sketches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single sketch
// @route   GET /api/sketches/:id
// @access  Public
const getSketchById = async (req, res) => {
    try {
        const sketch = await Sketch.findById(req.params.id);
        if (sketch) {
            res.json(sketch);
        } else {
            res.status(404).json({ message: 'Sketch not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a sketch
// @route   POST /api/sketches
// @access  Private/Admin
const createSketch = async (req, res) => {
    try {
        const { title, price, description, images, category, size, medium, isDigitalDownload, tagline } = req.body;
        
        const sketch = new Sketch({
            title,
            price,
            description,
            images,
            category,
            size,
            medium,
            isDigitalDownload,
            tagline
        });

        const createdSketch = await sketch.save();
        invalidateCache(); // Clear cache so next GET fetches fresh data
        res.status(201).json(createdSketch);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a sketch
// @route   PUT /api/sketches/:id
// @access  Private/Admin
const updateSketch = async (req, res) => {
    try {
        const { title, price, description, images, category, size, medium, isDigitalDownload, tagline } = req.body;
        const sketch = await Sketch.findById(req.params.id);

        if (sketch) {
            sketch.title = title || sketch.title;
            sketch.price = price || sketch.price;
            sketch.description = description || sketch.description;
            sketch.images = images || sketch.images;
            sketch.category = category || sketch.category;
            sketch.size = size || sketch.size;
            sketch.medium = medium || sketch.medium;
            sketch.isDigitalDownload = isDigitalDownload !== undefined ? isDigitalDownload : sketch.isDigitalDownload;
            sketch.tagline = tagline !== undefined ? tagline : sketch.tagline;

            const updatedSketch = await sketch.save();
            invalidateCache(); // Clear cache
            res.json(updatedSketch);
        } else {
            res.status(404).json({ message: 'Sketch not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a sketch
// @route   DELETE /api/sketches/:id
// @access  Private/Admin
const deleteSketch = async (req, res) => {
    try {
        const sketch = await Sketch.findById(req.params.id);

        if (sketch) {
            await sketch.deleteOne();
            invalidateCache(); // Clear cache
            res.json({ message: 'Sketch removed' });
        } else {
            res.status(404).json({ message: 'Sketch not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getSketches, getSketchById, createSketch, updateSketch, deleteSketch };
