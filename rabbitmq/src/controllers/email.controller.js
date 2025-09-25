import { publishOrderEvent } from "../services/email.service.js";

export const sendOrderNotification = async(req, res) => {
    const {id, product} = req.body;
    await publishOrderEvent({id, product});
    res.json({message: "order event published"});
}