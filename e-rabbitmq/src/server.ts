import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectRabbitMQ } from './config/rabbitmq';
import { startEmailConsumer } from './services/emailService';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-commerce API is running' });
});

const startServer = async () => {
  try {
    await connectRabbitMQ();
    startEmailConsumer(); // Start email consumer
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();