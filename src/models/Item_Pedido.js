export class ItensPedido {
  // Modelo de item de pedido. Representa a relação entre pedido e produto,
  // além de encapsular regras de validação e cálculo de subtotal.
  #id;
  #pedidoId;
  #idProduto;
  #estoque;
  #valorItem;

  constructor(pPedidoId, pIdProduto, pEstoque, pValorItem, pID) {
    this.#pedidoId = pPedidoId;
    this.#idProduto = pIdProduto;
    this.#estoque = pEstoque;
    this.#valorItem = pValorItem;
    this.#id = pID;
  }

  // Getters
  get id() {
    return this.#id;
  }

  get pedidoId() {
    return this.#pedidoId;
  }

  get idProduto() {
    return this.#idProduto;
  }

  get estoque() {
    return this.#estoque;
  }

  get valorItem() {
    return this.#valorItem;
  }

  // Setters
  set id(value) {
    this.#validarId(value);
    this.#id = value;
  }

  set pedidoId(value) {
    this.#validarPedidoId(value);
    this.#pedidoId = value;
  }

  set idProduto(value) {
    this.#validarProdutoId(value);
    this.#idProduto = value;
  }

  set estoque(value) {
    this.#validarEstoque(value);
    this.#estoque = value;
  }

  set valorItem(value) {
    this.#validarValorItem(value);
    this.#valorItem = value;
  }

  // Métodos auxiliares
  #validarId(value) {
    if (value && value <= 0) {
      throw new Error("Verifique o ID informado");
    }
  }

  #validarPedidoId(value) {
    if (!value || value <= 0) {
      throw new Error("Verifique o ID do pedido informado");
    }
  }

  #validarProdutoId(value) {
    if (!value || value <= 0) {
      throw new Error("Verifique o ID do produto informado");
    }
  }

  #validarEstoque(value) {
    if (!value || value <= 0) {
      throw new Error("Informe um estoque válido");
    }
  }

  #validarValorItem(value) {
    if (!value || value <= 0) {
      throw new Error("Informe um valor válido para o item");
    }
  }

  static calcularSubTotal(itens) {
    // Soma o valor de cada item levando em conta a quantidade.
    return itens.reduce(
      (total, item) => total + item.valorItem * item.estoque,
      0,
    );
  }

  // Factory Methods
  static criar(dados) {
    return new ItensPedido(
      dados.pedidoId,
      dados.idProduto,
      dados.estoque,
      dados.valorItem,
      null,
    );
  }

  static editar(dados, id) {
    return new ItensPedido(
      dados.idPedido,
      dados.idProduto,
      dados.estoque,
      dados.valorItem,
      id,
    );
  }
}
