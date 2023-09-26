require('dotenv').config();
const express = require('express');

const PORT = process.env.PORT || 3000;

const app = express();

app.get("/", (req, res) => {
    res.send("hhdfdj")
})

app.listen(PORT, () => console.log('server is runing'));