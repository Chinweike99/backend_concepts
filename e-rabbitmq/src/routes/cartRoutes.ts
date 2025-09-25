import { Router } from 'express';
import {
  getCartHandler,
  addToCartHandler,
  removeFromCartHandler,
  clearCartHandler
} from '../controllers/cartControllers';

const router = Router();

router.get('/:userId', getCartHandler);
router.post('/:userId/items', addToCartHandler);
router.delete('/:userId/items/:itemId', removeFromCartHandler);
router.delete('/:userId/clear', clearCartHandler);

export default router;