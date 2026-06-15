import { Router } from "express";
import produtoController from "../controllers/produto.controller.js";
import uploadImage from "../middlewares/uploadImage.js";

const produtoRoutes = Router();

produtoRoutes.get("/", produtoController.listarProdutos);
produtoRoutes.get("/:id", produtoController.listarIdProduto);
produtoRoutes.post("/", uploadImage, produtoController.criarProdutos);
produtoRoutes.put("/:id", uploadImage, produtoController.alterarProduto);
produtoRoutes.delete("/:id", produtoController.deletarProduto);

export default produtoRoutes;