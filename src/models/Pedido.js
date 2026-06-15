export class Pedido {
  #id;
  #subtotal;
  #status;
  #dataCad;

  // Contructor //
  constructor(pSubTotal, pStatus, pID) {
    this.#subtotal = pSubTotal;
    this.#status = pStatus;
    this.#id = pID;
  }
  // Getters //
  get id() {
    return this.#id;
  }

  get subTotal() {
    // Retorna o subtotal validado do pedido.
    return this.#subtotal;
  }
  get status() {
    return this.#status;
  }
  get dataCad() {
    return this.#dataCad;
  }

  // Setters //
  set id(value) {
    this.#validarId(value);
    return (this.#id = value);
  }
  set subTotal(value) {
    this.#validarSubTotal(value);
    return (this.#subtotal = value);
  }
  set status(value) {
    this.#validarStatus(value);
    return (this.#status = value);
  }
  // Métodos auxiliares //
  #validarId(value) {
    if (!value && value < 0) {
      throw new Error("Verifique o ID informado");
    }
  }

  #validarStatus(value) {
    if (!value || typeof value !== "string") {
      throw new Error("Status inválido");
    }
  }

  #validarSubTotal(value) {
    if (!value || value <= 0) {
      throw new Error("Não foi possivel obter o subtotal");
    }
  }

  //Desing Pattern
  static criar(dados) {
    return new Pedido(dados.subTotal, dados.status, null);
  }
  static editar(dados, id) {
    return new Pedido(null, dados.status, id);
  }
}
