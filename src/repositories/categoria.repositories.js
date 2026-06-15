import { connection } from "../config/Database.js";

const categoriaRepositories = {
  listar: async () => {
    const sql = "SELECT * FROM categorias;";
    const [rows] = await connection.execute(sql);
    return rows;
  },
  listarId: async id => {
    const sql = "SELECT * FROM categorias WHERE idCategoria = ?;";
    const values = [id];
    const [rows] = await connection.execute(sql, values);
    return rows;
  },
  criar: async categoria => {
    const sql = "INSERT INTO categorias (nome, descricao) VALUES (?,?);";
    const values = [categoria.nome, categoria.descricao];
    const [rows] = await connection.execute(sql, values);
    return rows;
  },
  alterar: async categoria => {
    const sql =
      "UPDATE categorias SET Nome=?, Descricao=? WHERE idCategoria=?;";
    const values = [categoria.nome, categoria.descricao, categoria.id];
    const [rows] = await connection.execute(sql, values);
    return rows;
  },
  deletar: async id => {
    const sql = "DELETE FROM categorias WHERE idCategoria=?;";
    const values = [id];
    const [rows] = await connection.execute(sql, values);
    return rows;
  },
};
export default categoriaRepositories;