import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Singleton para a conexão com o banco de dados
class Database {
  static #instance = null;
  #pool = null;

  #createPool() {
    this.#pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 100,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
      Database.#instance.#createPool();
    }
    return Database.#instance;
  }

  getPool() {
    return this.#pool;
  }
}

export const connection = Database.getInstance().getPool();

// export async function initializeDatabase() {
//   console.log("Inicializando o banco de dados e tabelas...");
//   try {
//     const tempConnection = await mysql.createConnection({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       port: process.env.DB_PORT,
//       ssl: { rejectUnauthorized: false },
//     });

//     const dbName = process.env.DB_DATABASE || "deploy";

//     await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
//     await tempConnection.query(`USE \`${dbName}\`;`);

//     await tempConnection.query(`DROP TABLE IF EXISTS itens_pedidos;`);
//     await tempConnection.query(`DROP TABLE IF EXISTS pedidos;`);
//     await tempConnection.query(`DROP TABLE IF EXISTS produtos;`);
//     await tempConnection.query(`DROP TABLE IF EXISTS categorias;`);

//     await tempConnection.query(`
//             CREATE TABLE categorias (
//             idCategoria int NOT NULL AUTO_INCREMENT,
//             nome varchar(100) NOT NULL,
//             descricao varchar(255) NOT NULL,
//             DataCad timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
//             PRIMARY KEY (idCategoria)
//         );
//         `);
    
//     await tempConnection.query(`
      
//            CREATE TABLE produtos (
//           idProduto int NOT NULL AUTO_INCREMENT,
//           idCategoria int NOT NULL,
//           nome varchar(100) NOT NULL,
//           descricao varchar(255) NOT NULL,
//           preco decimal(10, 2) NOT NULL,
//           Imagem varchar(255) NOT NULL,
//           estoque int NOT NULL,
//           DataCad timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
//           PRIMARY KEY (idProduto, idCategoria),
//           KEY fk_produtos_categorias_idx (idCategoria),
//           CONSTRAINT fk_produtos_categorias FOREIGN KEY (idCategoria) REFERENCES categorias (idCategoria)
//             );
//         `);
    
//     await tempConnection.query(`
//   CREATE TABLE pedidos (
//   idPedido int NOT NULL AUTO_INCREMENT,
//   subTotal decimal(10, 2) NOT NULL,
//   status enum('Aberto', 'Finalizado', 'Pendente') NOT NULL,
//   dataPedido timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   PRIMARY KEY (idPedido)
// );
//   `);
    
// await tempConnection.query(`
//   CREATE TABLE itens_pedidos (
//     idItensPedidos int NOT NULL AUTO_INCREMENT,
//     idPedido int NOT NULL,
//     idProduto int NOT NULL,
//     quantidade int NOT NULL,
//     valorItem decimal(10, 2) NOT NULL,
//     DataCad timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     PRIMARY KEY (idItensPedidos, idPedido, idProduto),
//     KEY fk_pedido_itens_pedido_idx (idPedido),
//     KEY fk_produto_itens_pedido_idx (idProduto),
//     CONSTRAINT fk_pedido_itens_pedido FOREIGN KEY (idPedido) REFERENCES pedidos (idPedido),
//     CONSTRAINT fk_produto_itens_pedido FOREIGN KEY (idProduto) REFERENCES produtos (idProduto)
//   )
// `);
//     await tempConnection.end();
//     console.log("Banco de dados e tabelas verificados/criados com sucesso.");
//   } catch (error) {
//     console.error("Erro ao criar o banco ou as tabelas:", error);
//     throw error;
//   }
// }
