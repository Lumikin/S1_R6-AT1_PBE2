import { Router } from "express";
import produtoRoutes from "./produtos.routes.js";
import categoriaRoutes from "./categoria.routes.js";
import pedidoRoutes from "./pedido.routes.js";
import imagemProdutoRoutes from "./imagemProduto.routes.js";

const routes = Router();

// Registra as rotas principais da API
routes.use("/produtos", produtoRoutes);
routes.use("/categorias", categoriaRoutes);
routes.use("/pedidos", pedidoRoutes);
routes.use("/images", imagemProdutoRoutes);

export default routes;
