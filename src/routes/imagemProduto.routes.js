import imagemProduto from "../controllers/imagemProduto.controller.js";
import { Router } from "express";

const imagemProdutoRoutes = Router();

imagemProdutoRoutes.get("/produto/:nome", imagemProduto.exibirImagem);

export default imagemProdutoRoutes;
