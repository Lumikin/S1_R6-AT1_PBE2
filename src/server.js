import path, { dirname } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes/router.js";
const app = express();
const port = process.env.SERVER_PORT || 8080;
import { initializeDatabase } from "./config/Database.js";

app.use(express.json());
app.use(cors());

app.use("/", routes);

initializeDatabase()
  .then(() => {
    app.listen(process.env.SERVER_PORT, () => {
      console.log(`Servidor rodando na porta ${process.env.SERVER_PORT}`);
    });
  })
  .catch(err => {
    console.error("Erro ao inicializar o banco de dados:", err);
  });
