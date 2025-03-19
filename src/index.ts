const cors = require('cors');
const dotenv = require('dotenv');
import express from "express";
const routes = require("./routes/IndexRoute");
import dbconnect from "./utils/dbconnect";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

dbconnect();
app.use(express.json());
app.use(cors());
function setHeaders(req: any, res: any, next: any) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token,Origin, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
    next()
}

app.use(setHeaders);
app.use(routes)
app.get("/", (req: any, res: any) => {
    res.send("Hello, TypeScript + Express + MongoDB!");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
