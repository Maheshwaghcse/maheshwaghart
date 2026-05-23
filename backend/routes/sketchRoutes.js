import express from 'express';
import { getSketches, getSketchById, createSketch, updateSketch, deleteSketch } from '../controllers/sketchController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getSketches).post(protect, admin, createSketch);
router.route('/:id')
    .get(getSketchById)
    .put(protect, admin, updateSketch)
    .delete(protect, admin, deleteSketch);

export default router;
