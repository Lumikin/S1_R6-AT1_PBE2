import { Router } from "express";
import pedidoController from "../controllers/pedido.controller.js";

const pedidoRoutes = Router();

pedidoRoutes.get("/", pedidoController.listarPedidos);
pedidoRoutes.post("/", pedidoController.criarPedido);

pedidoRoutes.get("/itens/", pedidoController.listarItens);
pedidoRoutes.get("/itens/:id", pedidoController.listarIDItem);
pedidoRoutes.put("/itens/:id", pedidoController.alterarItem);

pedidoRoutes.get("/:id", pedidoController.listarIDPedidos);
pedidoRoutes.put("/:id", pedidoController.atualizarPedido);
pedidoRoutes.delete("/:id", pedidoController.deletarPedido);

export default pedidoRoutes;
