import { Router } from "express";
import categoriaController from "../controllers/categoria.controller.js";

const categoriaRoutes = Router();

categoriaRoutes.get("/", categoriaController.listarCategorias);
categoriaRoutes.get("/:id", categoriaController.listarIdCategoria);
categoriaRoutes.post("/", categoriaController.criarCategoria);
categoriaRoutes.put("/:id", categoriaController.alterarCategoria);
categoriaRoutes.delete("/:id", categoriaController.deletarCategoria);

export default categoriaRoutes;