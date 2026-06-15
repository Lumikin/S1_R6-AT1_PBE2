import { connection } from "../config/Database.js";

const produtoRepositories = {
  listar: async () => {
    const sql = "SELECT * FROM produtos;";
    const [rows] = await connection.execute(sql);
    return rows;
  },
  listarId: async id => {
    const sql = "SELECT * FROM produtos WHERE idProduto = ?;";
    const values = [id];
    const [rows] = await connection.execute(sql, values);
    return rows;
  },
  criar: async produto => {
    const sql =
      "INSERT INTO produtos (idCategoria,nome,descricao,preco,Imagem,estoque) VALUES (?,?,?,?,?,?);";
    const values = [
      produto.idCategoria,
      produto.nome,
      produto.descricao,
      produto.preco,
      produto.Imagem,
      produto.estoque,
    ];
    const [rows] = await connection.execute(sql, values);
    return rows;
  },
  alterar: async produto => {
    const sql =
      "UPDATE produtos SET idCategoria=?, nome=?, descricao=?, preco=?, Imagem=?, estoque=? WHERE idProduto=?;";
    const values = [
      produto.idCategoria,
      produto.nome,
      produto.descricao,
      produto.preco,
      produto.Imagem,
      produto.estoque,
      produto.id,
    ];
    const [rows] = await connection.execute(sql, values);
    return rows;
  },
  deletar: async id => {
    const sql = "DELETE FROM produtos WHERE idProduto=?;";
    const values = [id];
    const [rows] = await connection.execute(sql, values);
    return rows;
  },
};
export default produtoRepositories;