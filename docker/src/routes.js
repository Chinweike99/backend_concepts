import { Router } from "express";
import pool from "./db.js";

const router = Router();

// create table if not exists
await pool.query(`
  CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT false
  )
`);

// GET all todos
router.get("/", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM todos ORDER BY id ASC");
  res.json(rows);
});

// CREATE a todo
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO todos (title) VALUES ($1) RETURNING *",
    [title]
  );
  res.status(201).json(rows[0]);
  } catch (error) {
    concole.log(error)
  }
});

// UPDATE a todo
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  const { rows } = await pool.query(
    "UPDATE todos SET completed=$1 WHERE id=$2 RETURNING *",
    [completed, id]
  );
  res.json(rows[0]);
});

// DELETE a todo
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM todos WHERE id=$1", [id]);
  res.sendStatus(204);
});

export default router;
