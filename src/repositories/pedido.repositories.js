import { connection } from "../config/Database.js";

const pedidoRepositories = {
  // Repositório de pedidos: responsável por todas as consultas e comandos SQL
  // relacionados à tabela pedidos e itens_pedidos.
  criarPedido: async (pedido, itemPed) => {
    const conn = await connection.getConnection();

    try {
      await conn.beginTransaction();

      // --- INSERT PEDIDO --- //
      // Insere o pedido principal com subtotal e status inicial.
      const sqlPedido = "INSERT INTO pedidos (Subtotal, Status) VALUES (?, ?);";
      const valuesPedido = [pedido.subTotal, pedido.status];
      const [rowsPedido] = await conn.execute(sqlPedido, valuesPedido);

      // --- INSERT ITENS_PEDIDO --- //
      // Insere cada item do pedido em transação, garantindo consistência.
      for (const item of itemPed) {
        // Verifica se o produto existe para evitar violação de FK
        const sqlCheckProduto =
          "SELECT idProduto FROM produtos WHERE idProduto = ?;";
        const [produtoRows] = await conn.execute(sqlCheckProduto, [
          item.idProduto,
        ]);
        if (!produtoRows.length) {
          throw new Error(`Produto não encontrado: ${item.idProduto}`);
        }
        const sqlItemPed =
          "INSERT INTO itens_pedidos (idPedido, idProduto, quantidade, valorItem) VALUES (?, ?, ?, ?);";
        const valuesItemPed = [
          rowsPedido.insertId,
          item.idProduto,
          item.estoque,
          item.valorItem,
        ];
        await conn.execute(sqlItemPed, valuesItemPed);
      }

      await conn.commit();
      return rowsPedido;
    } catch (error) {
      await conn.rollback();
      throw new Error(error);
    } finally {
      conn.release();
    }
  },
  listarPedidos: async () => {
    const sql = "SELECT * FROM pedidos;";
    const [rows] = await connection.execute(sql);
    return rows;
  },
  listarIDPedido: async id => {
    const sql = "SELECT * FROM pedidos WHERE idPedido = ?;";
    const values = [id];
    const [rows] = await connection.execute(sql, values);
    return rows;
  },
  alterarPedido: async pedido => {
    const sql = "UPDATE pedidos SET status = ? WHERE idPedido = ?;";
    const values = [pedido.status, pedido.id];
    const [rows] = await connection.execute(sql, values);
    return rows;
  },
  alterarStatusPedido: async pedido => {
    const sql = "UPDATE pedidos SET Status = ? WHERE idPedido = ?;";
    const values = [pedido.status, pedido.id];
    const [rows] = await connection.execute(sql, values);
    return rows;
  },
  deletarPedido: async id => {
    const conn = await connection.getConnection();

    try {
      await conn.beginTransaction();

      // --- DELETE ITENS DO PEDIDO --- //
      const sqlDeleteItens = "DELETE FROM itens_pedidos WHERE idPedido = ?;";
      await conn.execute(sqlDeleteItens, [id]);

      // --- DELETE PEDIDO --- //
      const sqlDeletePedido = "DELETE FROM pedidos WHERE idPedido = ?;";
      const [rows] = await conn.execute(sqlDeletePedido, [id]);

      await conn.commit();
      return rows;
    } catch (error) {
      await conn.rollback();
      throw new Error(error);
    } finally {
      conn.release();
    }
  },

  // --- Itens Pedidos --- //

  listarItensPorPedido: async pedidoId => {
    const sql = "SELECT * FROM itens_pedidos WHERE PedidoId = ?;";
    const values = [pedidoId];
    const [rows] = await connection.execute(sql, values);
    return rows;
  },
  listarItens: async () => {
    const sql = "SELECT * FROM itens_pedidos;";
    const [rows] = await connection.execute(sql);
    return rows;
  },
  listarIDItem: async id => {
    const sql = "SELECT * FROM itens_pedidos WHERE idItensPedidos = ?;";
    const values = [id];
    const [rows] = await connection.execute(sql, values);
    return rows;
  },
  alterarItem: async (itemId, item) => {
    const conn = await connection.getConnection();

    try {
      await conn.beginTransaction();

      // --- UPDATE ITEM --- //
      // Atualiza os dados de um item de pedido específico.
      const sqlUpdate =
        "UPDATE itens_pedidos SET idProduto = ?, quantidade = ?, valorItem = ? WHERE idItensPedidos = ?;";
      const valuesUpdate = [
        item.idProduto,
        item.estoque,
        item.valorItem,
        itemId,
      ];
      await conn.execute(sqlUpdate, valuesUpdate);

      // --- OBTER pedidoId DO ITEM ATUALIZADO --- //
      const sqlGetPedidoId = "SELECT idPedido FROM itens_pedidos WHERE idItensPedidos = ?;";
      const [itemRows] = await conn.execute(sqlGetPedidoId, [itemId]);
      if (!itemRows.length) {
        throw new Error("Item não encontrado após atualização");
      }
      const pedidoId = itemRows[0].idPedido;

      // --- RECALCULAR SUBTOTAL --- //
      // Após atualizar um item, recalcular o subtotal total do pedido.
      const sqlSubtotal =
        "SELECT COALESCE(SUM(quantidade * valorItem), 0) AS novoSubtotal FROM itens_pedidos WHERE idPedido = ?;";
      const [subtotalRows] = await conn.execute(sqlSubtotal, [pedidoId]);
      const novoSubtotal = subtotalRows[0].novoSubtotal;

      // --- UPDATE PEDIDO SUBTOTAL --- //
      const sqlUpdatePedido =
        "UPDATE pedidos SET subTotal = ? WHERE idPedido = ?;";
      await conn.execute(sqlUpdatePedido, [novoSubtotal, pedidoId]);

      await conn.commit();
      return { pedidoId, novoSubtotal };
    } catch (error) {
      await conn.rollback();
      throw new Error(error);
    } finally {
      conn.release();
    }
  },
  deletarItem: async itemId => {
    const conn = await connection.getConnection();

    try {
      await conn.beginTransaction();

      // --- BUSCAR PEDIDO DO ITEM --- //
      const sqlGetItem = "SELECT PedidoId FROM itens_pedidos WHERE id = ?;";
      const [itemRows] = await conn.execute(sqlGetItem, [itemId]);

      if (!itemRows.length) {
        throw new Error("Item não encontrado");
      }

      const pedidoId = itemRows[0].PedidoId;

      // --- DELETE ITEM --- //
      // Remove o item inválido e recalcula o subtotal do pedido.
      const sqlDeleteItem = "DELETE FROM itens_pedidos WHERE id = ?;";
      await conn.execute(sqlDeleteItem, [itemId]);

      // --- RECALCULAR SUBTOTAL --- //
      const sqlSubtotal =
        "SELECT COALESCE(SUM(Quantidade * ValorItem), 0) AS novoSubtotal FROM itens_pedidos WHERE PedidoId = ?;";
      const [subtotalRows] = await conn.execute(sqlSubtotal, [pedidoId]);
      const novoSubtotal = subtotalRows[0].novoSubtotal;

      // --- UPDATE PEDIDO SUBTOTAL --- //
      const sqlUpdatePedido =
        "UPDATE pedidos SET Subtotal = ? WHERE idPedido = ?;";
      await conn.execute(sqlUpdatePedido, [novoSubtotal, pedidoId]);

      await conn.commit();
      return { pedidoId, novoSubtotal };
    } catch (error) {
      await conn.rollback();
      throw new Error(error);
    } finally {
      conn.release();
    }
  },
};

export default pedidoRepositories;
