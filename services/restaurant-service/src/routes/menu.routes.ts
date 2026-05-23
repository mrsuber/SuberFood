import { Router } from 'express';
import {
  getMenu,
  getMenuItem,
  getMenuCategories,
  getFeaturedMenuItems,
  addToFavorites,
  removeFromFavorites,
} from '../controllers/menu.controller';

const router = Router();

// Public routes
router.get('/', getMenu);
router.get('/categories', getMenuCategories);
router.get('/featured', getFeaturedMenuItems);
router.get('/:id', getMenuItem);

// User routes (require authentication in production)
router.post('/:id/favorite', addToFavorites);
router.delete('/:id/favorite', removeFromFavorites);

export default router;
