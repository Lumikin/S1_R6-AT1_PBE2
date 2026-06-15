export class Produtos {
  #id;
  #idCategoria;
  #nome;
  #descricao;
  #preco;
  #Imagem;
  #estoque;

  constructor(idCategoria, nome, descricao, preco, Imagem, estoque, id) {
    this.idCategoria = idCategoria;
    this.nome = nome;
    this.descricao = descricao;
    this.preco = preco;
    this.Imagem = Imagem;
    this.estoque = estoque;
    this.id = id;
  }

  get id() {
    return this.#id;
  }

  set id(value) {
    this.#validarId(value);
    this.#id = value;
  }

  get idCategoria() {
    return this.#idCategoria;
  }

  set idCategoria(value) {
    this.#validarIdCategoria(value);
    this.#idCategoria = value;
  }

  get nome() {
    return this.#nome;
  }

  set nome(value) {
    this.#validarNome(value);
    this.#nome = value;
  }

  get descricao() {
    return this.#descricao;
  }

  set descricao(value) {
    this.#validarDescricao(value);
    this.#descricao = value;
  }

  get preco() {
    return this.#preco;
  }

  set preco(value) {
    this.#validarPreco(value);
    this.#preco = value;
  }

  get Imagem() {
    return this.#Imagem;
  }

  set Imagem(value) {
    this.#validarImagem(value);
    this.#Imagem = value || null;
  }

  get estoque() {
    return this.#estoque;
  }

  set estoque(value) {
    this.#validarEstoque(value);
    this.#estoque = value;
  }

  #validarId(value) {
    if (value !== null && value !== undefined && (isNaN(value) || Number(value) <= 0)) {
      throw new Error("O valor do Id nao corresponde ao esperado");
    }
  }

  #validarIdCategoria(value) {
    if (!value || isNaN(value) || Number(value) <= 0) {
      throw new Error("O valor do IdCategoria nao corresponde ao esperado");
    }
  }

  #validarNome(value) {
    if (!value || value.trim().length < 3 || value.trim().length > 45) {
      throw new Error("O campo nome e obrigatorio e deve ter entre 3 e 45 caracteres");
    }
  }

  #validarDescricao(value) {
    if (!value || value.trim().length < 5 || value.trim().length > 100) {
      throw new Error("O campo descricao e obrigatorio e deve ter entre 5 e 100 caracteres");
    }
  }

  #validarPreco(value) {
    if (!value || isNaN(value) || Number(value) <= 0) {
      throw new Error("O campo preco deve ser um numero valido e maior do que 0");
    }
  }

  #validarImagem(value) {
    if (value && value.trim().length < 3) {
      throw new Error("Verifique se o caminho da imagem esta correto");
    }
  }

  #validarEstoque(value) {
    if (value === undefined || value === null || isNaN(value) || Number(value) < 0) {
      throw new Error("O campo estoque deve ser um numero valido e maior ou igual a 0");
    }
  }

  static criar(dados) {
    return new Produtos(
      dados.idCategoria,
      dados.nome,
      dados.descricao,
      dados.preco,
      dados.Imagem,
      dados.estoque,
      null,
    );
  }

  static editar(dados, id) {
    return new Produtos(
      dados.idCategoria,
      dados.nome,
      dados.descricao,
      dados.preco,
      dados.Imagem,
      dados.estoque,
      id,
    );
  }
}