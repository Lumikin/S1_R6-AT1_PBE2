import pedidoRepositories from "../repositories/pedido.repositories.js";
import { Pedido } from "../models/Pedido.js";
import { ItensPedido } from "../models/Item_Pedido.js";
import { statusPedido } from "../enum/statusPedido.enum.js";

const pedidoController = {
  // Controller de pedidos: encaminha requisições HTTP ao repositório
  // e formata respostas JSON adequadas.
  listarPedidos: async (req, res) => {
    try {
      const result = await pedidoRepositories.listarPedidos();

      if (result.length === 0) {
        return res.status(200).json({
          Message: "Essa tabela não contem registros",
        });
      }

      res.status(201).json({ result });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Ocorreu um erro no servidor",
      });
    }
  },

  listarIDPedidos: async (req, res) => {
    try {
      const id = Number(req.params.id);
      const result = await pedidoRepositories.listarIDPedido(id);

      if (result.length === 0) {
        return res.status(200).json({
          Message: "Esse ID não contem registro!",
        });
      }

      res.status(201).json({ result });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Ocorreu um erro no servidor",
      });
    }
  },

  criarPedido: async (req, res) => {
    try {
      const { itens } = req.body;

      // Converte cada item do payload em uma instância de model de item de pedido
      const itensPedido = itens.map((item) => {
        console.log("Itens:", item);
        return ItensPedido.criar({
          idProduto: item.idProduto,
          estoque: item.estoque,
          quantidade: item.quantidade,
          valorItem: item.valorItem,
        });
      });

      console.log(itensPedido);

      // Calcula o subtotal usando a regra de negócio da model ItensPedido
      const subTotalItens = ItensPedido.calcularSubTotal(itensPedido);

      // Cria o pedido com subtotal calculado e status inicial Aberto
      const pedido = Pedido.criar({
        subTotal: subTotalItens,
        status: statusPedido.ABERTO,
      });

      const result = await pedidoRepositories.criarPedido(pedido, itensPedido);

      return res.status(200).json({ result });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Ocorreu um erro no servidor",
        Error: error.message,
      });
    }
  },

  atualizarPedido: async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      const statusValidos = statusPedido;

      if (
        !status ||
        (status !== statusValidos.ABERTO &&
          status !== statusValidos.FINALIZADO &&
          status !== statusValidos.PENDENTE)
      ) {
        return res.status(400).json({
          message: "Status inválido, informe Aberto, Finalizado ou Pendente",
        });
      }

      const pedido = Pedido.editar({ status }, id);

      const result = await pedidoRepositories.alterarStatusPedido(pedido);

      if (result.affectedRows === 0) {
        return res.status(400).json({
          message: "Erro ao atualizar o pedido. Pedido não encontrado.",
          data: result,
        });
      }

      res.status(200).json({ result });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Ocorreu um erro no servidor",
      });
    }
  },

  deletarPedido: async (req, res) => {
    try {
      const id = Number(req.params.id);
      const pedido = await pedidoRepositories.listarIDPedido(id);

      if (!id || isNaN(id) || id <= 0) {
        return res.status(400).json({
          message: "Id inválido.",
        });
      }
      if (pedido.length === 0) {
        return res.status(400).json({
          message: "Pedido não encontrado.",
        });
      }

      const result = await pedidoRepositories.deletarPedido(id);

      res.status(200).json({ result });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Ocorreu um erro no servidor",
      });
    }
  },

  // --- Itens Pedido --- //
  //
  listarItens: async (req, res) => {
    try {
      const id = Number(req.params.id);
      const result = await pedidoRepositories.listarItens(id);

      if (result.length === 0) {
        return res.status(200).json({
          message: "Essa tabela esta vazia.",
          data: result,
        });
      }

      res.status(200).json({ result });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Ocorreu um erro no servidor",
      });
    }
  },
  listarIDItem: async (req, res) => {
    try {
      const id = Number(req.params.id);
      const result = await pedidoRepositories.listarIDItem(id);

      if (result.length === 0) {
        return res.status(200).json({
          message: "ID incorreto ou não existente",
          data: result,
        });
      }

      res.status(200).json({ result });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Ocorreu um erro no servidor",
      });
    }
  },
  alterarItem: async (req, res) => {
    try {
      const itemId = Number(req.params.id);
      const { idProduto, estoque, valorItem } = req.body;

      // Cria uma instância de item de pedido atualizada antes de salvar
      const item = ItensPedido.editar(
        { idProduto, estoque, valorItem },
        itemId,
      );
      const result = await pedidoRepositories.alterarItem(item);

      res.status(200).json({ result });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Ocorreu um erro no servidor",
      });
    }
  },
};

export default pedidoController;
