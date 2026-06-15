import mysql from "mysql2/promise";
import "dotenv/config";

// Padrão de projeto ultilizado na classe de conexão com banco de dados: SINGLETON
class Databse {
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
    });
  }
  static getInstance() {
    if (!Databse.#instance) {
      Databse.#instance = new Databse();
      Databse.#instance.#createPool();
    }
    return Databse.#instance;
  }

  getPool() {
    return this.#pool;
  }
}

export const connection = Databse.getInstance().getPool();