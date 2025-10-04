
import { publishOrder } from "../services/order.service.js";


export const creatOrder = async (req, res) => {
    const {id, product} = req.body;
    await publishOrder({ id, product });
    res.json({ message: "Order sent to queue" });
}