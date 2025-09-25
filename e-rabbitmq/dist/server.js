"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const rabbitmq_1 = require("./config/rabbitmq");
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
// import orderRoutes from './routes/orderRoutes';
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/cart', cartRoutes_1.default);
// app.use('/api/orders', orderRoutes);
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'E-commerce API is running' });
});
const startServer = async () => {
    try {
        await (0, rabbitmq_1.connectRabbitMQ)();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
