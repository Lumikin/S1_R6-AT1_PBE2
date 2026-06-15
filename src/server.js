import path, { dirname } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes/router.js";
const app = express();
const port = process.env.SERVER_PORT || 8080;

app.use(express.json());
app.use(cors());

app.use("/", routes);

app.listen(port, () => {
  console.log(`Servidor rodando em: http://localhost:${port}`);
});
