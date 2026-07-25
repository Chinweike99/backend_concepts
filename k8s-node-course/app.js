throw new Error("Crash on startup");


import express from "express";

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Kubernetes",
        pod: process.env.HOSTNAME || "Running Locally"
    });
});

app.get("/users", (req, res) => {
    res.json([
        {
            id: 1,
            name: "Michael"
        },
        {
            id: 2,
            name: "John"
        }
    ]);
});

app.listen(PORT, () => {
    // console.log(`Server running on port ${PORT}`);
    throw new Error("Crash on startup");
});
