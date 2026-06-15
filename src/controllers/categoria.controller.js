import { Categoria } from "../models/Categoria.js";
import categoriaRepositories from "../repositories/categoria.repositories.js";

const categoriaController = {
  // Controller de categoria: faz a ponte entre as requisições HTTP e o repositório.
  listarCategorias: async (req, res) => {
    try {
      const result = await categoriaRepositories.listar();
      if (result.length === 0) {
        return res.status(200).json({
          Message: "Categorias não existem nessa tabela",
        });
      }
      res.status(200).json({
        Data: result,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Ocorreu um erro no servidor",
      });
    }
  },
  listarIdCategoria: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id || id === undefined || isNaN(id) || id < 0) {
        return res.status(400).json({
          Message: "Digite um id válido",
        });
      }
      const result = await categoriaRepositories.listarId(id);
      if (result.length === 0) {
        return res.status(404).json({
          Message: "Esse id não existe",
        });
      }
      res.status(200).json({
        Data: result,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Ocorreu um erro no servidor",
      });
    }
  },
  criarCategoria: async (req, res) => {
    try {
      const { nome, descricao } = req.body;
      const categoria = Categoria.criar({ nome, descricao }); // Cria o objeto categoria com os dados
      const result = await categoriaRepositories.criar(categoria); // Persiste a categoria no banco de dados
      res.status(201).json({
        Message: "Categoria criada",
        Data: result,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        Message: "Ocorreu um erro no servidor",
        Error: error,
      });
    }
  },
  alterarCategoria: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, descricao } = req.body;
      if (!nome.trim() || !descricao.trim()) {
        return res.status(400).json({
          Message: "Preencha os campos nome e descrição",
        });
      }
      if (!id || isNaN(id) || Number(id) <= 0) {
        return res.status(400).json({
          Message: "Digite um id valido",
        });
      }
      const categoria = Categoria.editar({ nome, descricao }, id); //Cria o objeto categoria com os dados
      const result = await categoriaRepositories.alterar(categoria);
      if (result.affectedRows === 0) {
        return res.status(400).json({
          Message: "Erro ao alterar categoria",
        });
      }
      res.status(200).json({
        Message: "Categoria alterada com sucesso",
        Data: result,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Ocorreu um erro no servidor",
        Error: error,
      });
    }
  },
  deletarCategoria: async (req, res) => {
    try {
      const { id } = req.params;
      const buscaId = await categoriaRepositories.listarId(id); // Busca do ID da categoria para verificar se existe
      if (buscaId.length === 0 || !id || isNaN(id) || Number(id) <= 0) {
        return res.status(400).json({
          Message: "Digite um id valido",
        });
      }
      const result = await categoriaRepositories.deletar(id);
      if (result.affectedRows === 0) {
        return res.status(400).json({
          Message: "Erro ao deletar",
          Data: result,
        });
      }
      res.status(200).json({
        Message: "Categoria deletada!",
        Data: result,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Ocorreu um erro no servidor",
      });
    }
  },
};
export default categoriaController;
