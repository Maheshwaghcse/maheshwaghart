import express from 'express';
import { createCustomRequest } from '../controllers/customRequestController.js';

const router = express.Router();

router.post('/', createCustomRequest);

export default router;
