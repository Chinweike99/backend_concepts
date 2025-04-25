import express from 'express';
import { asyncHandler } from '../middlewares/errorhandlers.js';

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


export default router;