import { Router } from 'express';
import {
  createOrderHandler,
  getOrdersHandler,
  getOrderHandler
} from '../controllers/orderControllers';

const router = Router();

router.post('/:userId', createOrderHandler);
router.get('/:userId', getOrdersHandler);
router.get('/details/:orderId', getOrderHandler);

export default router;