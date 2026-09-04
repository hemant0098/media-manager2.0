require("dotenv").config();

const express = require("express");
const cors = require("cors");

/*app.use(cors({
  origin: "*"
}));*/

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api", require("./routes/mediaRoutes"));

app.get("/", (req, res) => {
    res.send("Media Manager API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
