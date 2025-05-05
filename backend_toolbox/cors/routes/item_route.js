import express from 'express';
import { AppError, asyncHandler } from '../middlewares/errorhandlers.js';

const router = express.Router();
const app = express();
app.use(express());

const items = [
    {id: 1, item: "First item"},
    {id: 2, item: "Second item"},
    {id: 3, item: "Third item"},
    {id: 4, item: "Fourth item"},
    {id: 5, item: "Fifth item"},
];

router.get('/items', asyncHandler(async (req, res) =>{
    res.json(items)
}));

router.post('/item', asyncHandler(async(req, res) => {
    const content = req.body.name;
    if(!content){
        throw new AppError("Item does not exist")
        // console.log(error)
    }
    const newItem = {
        id: items.length + 1,
        name: req.body.name
    }

    items.push(newItem);
    return res.status(200).json(newItem);
}))


export default router;