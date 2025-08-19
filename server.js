const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello API Server!" });
});

app.post("/api/echo", (req, res) => {
    res.json({ you_sent: req.body });
});

app.listen(port, () => console.log(`Server running at http://0.0.0.0:${port}`));
