import fs from "fs";
import path from "path";
import produtoRepositories from "../repositories/produto.repositories.js";
import { Produtos } from "../models/Produtos.js";
import categoriaRepositories from "../repositories/categoria.repositories.js";

// Controller de produto: trata as requisições HTTP relacionadas a produtos,
// valida dados de entrada e chama o repositório para executar comandos SQL.
const produtoController = {
  listarProdutos: async (req, res) => {
    try {
      const result = await produtoRepositories.listar();

      // --- Verificação se existem produtos --- //
      if (result.length === 0) {
        return res.status(200).json({
          Message: "Produtos não existem nessa tabela",
        });
      }

      // --- Mensagem de produtos listados --- //
      res.status(200).json({
        Message: "Produtos Listados:",
        Data: result,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Ocorreu um erro no servidor",
      });
    }
  },
  listarIdProduto: async (req, res) => {
    try {
      const { id } = req.params;

      // --- Verificação de ID válido --- //
      if (!id || id === undefined || isNaN(id) || id < 0) {
        return res.status(400).json({
          Message: "Digite um id válido",
        });
      }

      const result = await produtoRepositories.listarId(id);

      // --- Verificação se o ID existe --- //
      if (result.length === 0) {
        return res.status(200).json({
          Message: "Esse id não existe",
        });
      }

      res.status(200).json({
        // --- Mensagem de produto encontrado --- //
        Message: "Produto Encontrado:",
        Data: result,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Ocorreu um erro no servidor",
      });
    }
  },
  criarProdutos: async (req, res) => {
    try {
      const { idCategoria, nome, descricao, preco, estoque } = req.body;

      // Se o upload falhar, retorna erro antes de criar o produto.
      if (!req.file) {
        return res.status(400).json({
          message: "Arquivo de imagem não enviado",
        });
      }

      const Imagem = `uploads/images/${req.file.filename}`; // Caminho relativo da imagem

      const produto = Produtos.criar({
        idCategoria,
        nome,
        descricao,
        preco,
        Imagem,
        estoque,
      });

      const result = await produtoRepositories.criar(produto);

      // --- Mensagem de produto criado --- //
      res.status(201).json({
        Message: "Produto criado com sucesso",
        Data: result,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "Ocorreu um erro no servidor",
        Error: error.message,
      });
    }
  },
  alterarProduto: async (req, res) => {
    try {
      const { id } = req.params;
      let { idCategoria, nome, descricao, preco, estoque } = req.body;

      // Validação do ID do produto antes de alterar.
      if (!id || isNaN(id) || Number(id) <= 0) {
        return res.status(400).json({
          Message: "Digite um id válido",
        });
      }

      // Busca produto existente para retornar erro se não encontrado.
      const produtoExistente = await produtoRepositories.listarId(id);
      if (produtoExistente.length === 0) {
        return res.status(400).json({
          Message: "Produto não encontrado",
        });
      }
      const Imagem = `uploads/images/${req.file.filename}`; // --- Caminho relativo da imagem --- //
      const produto = Produtos.editar(
        {
          idCategoria,
          nome,
          descricao,
          preco,
          Imagem,
          estoque,
        },
        id,
      );

      const result = await produtoRepositories.alterar(produto);

      if (result.affectedRows === 0) {
        return res.status(400).json({
          Message: "Erro ao alterar produto",
        });
      }

      console.log("Produto alterado", result);
      res.status(200).json({
        Message: "Produto alterado com sucesso",
        Data: result,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: "Ocorreu um erro no servidor",
        Error: error.message,
      });
    }
  },
  deletarProduto: async (req, res) => {
    try {
      const { id } = req.params;
      const buscaId = await produtoRepositories.listarId(id);

      // --- Verificação de ID válido --- //
      if (!id || buscaId.length === 0) {
        return res.status(400).json({
          Message: "Insira um Id válido",
        });
      }

      const result = await produtoRepositories.deletar(id);

      console.log("Produto Deletado", result);

      // --- Mensagem de produto deletado --- //
      res.status(200).json({
        Message: "Produto deletado!",
        Data: result,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Ocorreu um erro no servidor",
        error: error.message,
      });
    }
  },
};

export default produtoController;
