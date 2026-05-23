import { Router } from 'express';
import {
  getLocations,
  getLocation,
  getWaitTime,
  updateWaitTime,
  getLocationMenu,
} from '../controllers/location.controller';

const router = Router();

// Public routes
router.get('/', getLocations);
router.get('/:identifier', getLocation);
router.get('/:id/wait-time', getWaitTime);
router.get('/:id/menu', getLocationMenu);

// Admin routes (require authentication in production)
router.put('/:id/wait-time', updateWaitTime);

export default router;
