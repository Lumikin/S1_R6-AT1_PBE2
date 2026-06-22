## 1. Visão Geral

O **Market API** é uma API REST de gerenciamento de um marketplace simples. Ela permite cadastrar categorias, produtos (com imagem), criar pedidos com múltiplos itens e controlar o status de cada pedido. O projeto foi desenvolvido como atividade acadêmica (AT1 — PBE2) e publicado em hospedagem gratuita via Render.

**Funcionalidades principais:**

- CRUD completo de **categorias**
- CRUD completo de **produtos** com **upload de imagem** (JPEG/PNG, até 10 MB)
- CRUD de **pedidos**, com suporte a transações atômicas no banco
- Gerenciamento de **itens de pedido**, com recálculo automático de subtotal
- Servir arquivos de imagem diretamente pela API

---

## 2. Estrutura de Pastas

```
S1_R6-AT1_PBE2-main/
├── .env.example               # Modelo das variáveis de ambiente
├── .gitignore
├── package.json               # Dependências e metadados
├── docs/
│   └── Deploy                 # Coleção Insomnia (YAML) com todas as requisições
├── src/
│   ├── server.js              # Ponto de entrada: inicializa Express e escuta a porta
│   ├── config/
│   │   ├── Database.js        # Singleton de pool de conexões MySQL
│   │   └── Multer.js          # Fábrica configurável de instâncias Multer
│   ├── controllers/
│   │   ├── categoria.controller.js
│   │   ├── produto.controller.js
│   │   ├── pedido.controller.js
│   │   └── imagemProduto.controller.js
│   ├── enum/
│   │   └── statusPedido.enum.js   # Constantes de status do pedido
│   ├── middlewares/
│   │   └── uploadImage.js         # Middleware de upload configurado para imagens
│   ├── models/
│   │   ├── Categoria.js
│   │   ├── Produtos.js
│   │   ├── Pedido.js
│   │   └── Item_Pedido.js
│   ├── repositories/
│   │   ├── categoria.repositories.js
│   │   ├── produto.repositories.js
│   │   └── pedido.repositories.js
│   └── routes/
│       ├── router.js              # Roteador raiz — agrega todos os sub-roteadores
│       ├── categoria.routes.js
│       ├── produtos.routes.js
│       ├── pedido.routes.js
│       └── imagemProduto.routes.js
└── uploads/
    └── images/                # Imagens enviadas pelos usuários (geradas em runtime)
```

---

## 3. Configuração e Instalação

### Pré-requisitos

- Node.js 18+
- MySQL 8+ ou MariaDB 10.6+

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/Lumikin/S1_R6-AT1_PBE2.git
cd S1_R6-AT1_PBE2

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar o .env com os dados do banco e porta desejada

# 4. Criar as tabelas no banco (ver seção 5)

# 5. Iniciar o servidor
node src/server.js
```

O servidor exibirá no console:

```
Servidor rodando na porta <SERVER_PORT>
```

---

## 4. Variáveis de Ambiente

O arquivo `.env.example` serve como template. Crie um `.env` na raiz com os seguintes campos:

| Variável      | Descrição                              |
|---------------|----------------------------------------|
| `SERVER_PORT` | Porta em que o Express vai escutar     |
| `DB_HOST`     | Host do banco de dados MySQL           |
| `DB_DATABASE` | Nome do banco de dados                 |
| `DB_USER`     | Usuário do banco                       |
| `DB_PASSWORD` | Senha do banco                         |
| `DB_PORT`     | Porta do banco (padrão MySQL = 3306)   |

---

## 5. Banco de Dados

O schema completo do banco está embutido (comentado) no arquivo `src/config/Database.js`. As tabelas devem ser criadas manualmente antes de iniciar a aplicação.

### Diagrama de Entidade-Relacionamento

```
categorias
  └── idCategoria (PK, AUTO_INCREMENT)
  └── nome
  └── descricao
  └── DataCad

produtos
  └── idProduto (PK, AUTO_INCREMENT)
  └── idCategoria (FK → categorias.idCategoria)
  └── nome
  └── descricao
  └── preco (DECIMAL 10,2)
  └── Imagem (VARCHAR 255)
  └── estoque
  └── DataCad

pedidos
  └── idPedido (PK, AUTO_INCREMENT)
  └── subTotal (DECIMAL 10,2)
  └── status (ENUM: 'Aberto', 'Finalizado', 'Pendente')
  └── dataPedido

itens_pedidos
  └── idItensPedidos (PK, AUTO_INCREMENT)
  └── idPedido (FK → pedidos.idPedido)
  └── idProduto (FK → produtos.idProduto)
  └── quantidade
  └── valorItem (DECIMAL 10,2)
  └── DataCad
```

### Script SQL

```sql
CREATE DATABASE IF NOT EXISTS `market_db`;
USE `market_db`;

CREATE TABLE categorias (
  idCategoria INT NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(100) NOT NULL,
  descricao   VARCHAR(255) NOT NULL,
  DataCad     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (idCategoria)
);

CREATE TABLE produtos (
  idProduto   INT NOT NULL AUTO_INCREMENT,
  idCategoria INT NOT NULL,
  nome        VARCHAR(100) NOT NULL,
  descricao   VARCHAR(255) NOT NULL,
  preco       DECIMAL(10,2) NOT NULL,
  Imagem      VARCHAR(255) NOT NULL,
  estoque     INT NOT NULL,
  DataCad     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (idProduto, idCategoria),
  KEY fk_produtos_categorias_idx (idCategoria),
  CONSTRAINT fk_produtos_categorias
    FOREIGN KEY (idCategoria) REFERENCES categorias (idCategoria)
);

CREATE TABLE pedidos (
  idPedido    INT NOT NULL AUTO_INCREMENT,
  subTotal    DECIMAL(10,2) NOT NULL,
  status      ENUM('Aberto','Finalizado','Pendente') NOT NULL,
  dataPedido  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (idPedido)
);

CREATE TABLE itens_pedidos (
  idItensPedidos INT NOT NULL AUTO_INCREMENT,
  idPedido       INT NOT NULL,
  idProduto      INT NOT NULL,
  quantidade     INT NOT NULL,
  valorItem      DECIMAL(10,2) NOT NULL,
  DataCad        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (idItensPedidos, idPedido, idProduto),
  KEY fk_pedido_itens_pedido_idx (idPedido),
  KEY fk_produto_itens_pedido_idx (idProduto),
  CONSTRAINT fk_pedido_itens_pedido
    FOREIGN KEY (idPedido) REFERENCES pedidos (idPedido),
  CONSTRAINT fk_produto_itens_pedido
    FOREIGN KEY (idProduto) REFERENCES produtos (idProduto)
);
```

---

## 6. Arquitetura da Aplicação

O projeto segue uma arquitetura em camadas (Layered Architecture / MVC adaptado), com as responsabilidades bem separadas:

```
Requisição HTTP
      │
      ▼
  [ Routes ]          — Define verbo + caminho e aponta para o controller
      │
      ▼
  [ Middleware ]       — Processa upload de arquivos antes do controller (Multer)
      │
      ▼
  [ Controller ]       — Valida entrada, chama o Model para instanciar objeto, chama Repository
      │
      ▼
  [ Model ]            — Encapsula dados e regras de negócio; expõe Factory Methods
      │
      ▼
  [ Repository ]       — Executa SQL no banco de dados via pool de conexões
      │
      ▼
  [ Database ]         — Singleton com pool MySQL (mysql2/promise)
```

**Fluxo de dados resumido:**

1. A rota recebe a requisição e aplica middlewares (ex: upload de imagem).
2. O controller extrai os dados do `req.body` / `req.params` / `req.file`.
3. O controller usa o Factory Method do Model (`criar` ou `editar`) para montar o objeto com validação.
4. O controller chama o Repository passando o objeto validado.
5. O Repository executa a query SQL e retorna os resultados.
6. O controller formata a resposta JSON e a envia ao cliente.

---

## 7. Módulos e Camadas

### 7.1 Config

#### `src/config/Database.js`

Implementa o padrão **Singleton** para gerenciar o pool de conexões com o MySQL.

- Usa `mysql2/promise` para suporte a `async/await`.
- Cria um único `pool` com até **100 conexões** simultâneas.
- Ativa `ssl: { rejectUnauthorized: false }` para suportar bancos hospedados (como PlanetScale/Render).
- Exporta `connection` — a instância pronta do pool — para uso nos repositories.

```js
// Uso nos repositories
import { connection } from "../config/Database.js";
const [rows] = await connection.execute("SELECT * FROM categorias");
```

> Existe código comentado de auto-inicialização do banco (`initializeDatabase`). Ela criaria automaticamente o banco e as tabelas no primeiro boot, mas foi desativada pois o banco já é criado externamente no ambiente de produção.

---

#### `src/config/Multer.js`

Exporta uma **fábrica configurável** (`createMulter`) que retorna uma instância do Multer personalizada.

Parâmetros aceitos pela fábrica:

| Parâmetro      | Tipo       | Descrição                                           |
|----------------|------------|-----------------------------------------------------|
| `folder`       | `string`   | Subpasta dentro de `uploads/` onde salvar arquivos  |
| `allowedTypes` | `string[]` | Lista de MIME types aceitos                         |
| `fileSize`     | `number`   | Tamanho máximo em bytes                             |

Comportamento:

- Cria o diretório de destino automaticamente se não existir.
- Gera um nome de arquivo único com **18 bytes aleatórios em hex** + nome original (ex: `a3f1...9c-foto.jpg`), evitando colisões.
- Rejeita arquivos com MIME type não permitido.

---

### 7.2 Models

Todas as classes de model utilizam **private fields** (`#campo`) com getters, setters com validação, e o padrão **Factory Method** com dois métodos estáticos:

- `static criar(dados)` — para inserções (id = `null`)
- `static editar(dados, id)` — para atualizações (id preenchido)

#### `Categoria`

| Campo      | Validação                              |
|------------|----------------------------------------|
| `nome`     | Obrigatório, entre 3 e 45 caracteres   |
| `descricao`| Opcional, entre 5 e 100 caracteres     |
| `id`       | Deve ser positivo quando presente      |

#### `Produtos`

| Campo        | Validação                                           |
|--------------|-----------------------------------------------------|
| `idCategoria`| Obrigatório, número positivo                        |
| `nome`       | Obrigatório, entre 3 e 45 caracteres                |
| `descricao`  | Obrigatório, entre 5 e 100 caracteres               |
| `preco`      | Obrigatório, número positivo                        |
| `Imagem`     | Opcional, caminho com no mínimo 3 caracteres        |
| `estoque`    | Obrigatório, número ≥ 0                             |
| `id`         | Pode ser `null` (criação) ou positivo (edição)      |

#### `Pedido`

| Campo      | Validação                                        |
|------------|--------------------------------------------------|
| `subTotal` | Obrigatório, número positivo                     |
| `status`   | Obrigatório, string (controlada pelo enum)       |
| `id`       | Positivo quando presente                         |

#### `ItensPedido`

| Campo      | Validação                                        |
|------------|--------------------------------------------------|
| `pedidoId` | Pode ser `null`; quando presente deve ser > 0   |
| `idProduto`| Obrigatório, número positivo                    |
| `quantidade`| Obrigatório, número positivo                   |
| `valorItem`| Obrigatório, número positivo                    |

**Método estático especial:**

```js
ItensPedido.calcularSubTotal(itens)
// Recebe array com { quantidade, valorItem }
// Retorna: soma de (valorItem × quantidade) para todos os itens
```

---

### 7.3 Repositories

Cada repository é um objeto literal com métodos `async` que executam queries SQL via `connection` (o pool do Singleton).

#### `categoria.repositories.js`

| Método      | SQL                                                              |
|-------------|------------------------------------------------------------------|
| `listar`    | `SELECT * FROM categorias`                                       |
| `listarId`  | `SELECT * FROM categorias WHERE idCategoria = ?`                 |
| `criar`     | `INSERT INTO categorias (nome, descricao) VALUES (?, ?)`         |
| `alterar`   | `UPDATE categorias SET Nome=?, Descricao=? WHERE idCategoria=?`  |
| `deletar`   | `DELETE FROM categorias WHERE idCategoria=?`                     |

#### `produto.repositories.js`

| Método     | SQL                                                                                 |
|------------|-------------------------------------------------------------------------------------|
| `listar`   | `SELECT * FROM produtos`                                                            |
| `listarId` | `SELECT * FROM produtos WHERE idProduto = ?`                                        |
| `criar`    | `INSERT INTO produtos (idCategoria, nome, descricao, preco, Imagem, estoque) VALUES (?,?,?,?,?,?)` |
| `alterar`  | `UPDATE produtos SET idCategoria=?, nome=?, descricao=?, preco=?, Imagem=?, estoque=? WHERE idProduto=?` |
| `deletar`  | `DELETE FROM produtos WHERE idProduto=?`                                            |

#### `pedido.repositories.js`

Este repositório é o mais complexo. Operações de escrita que envolvem múltiplas tabelas usam **transações explícitas** (`beginTransaction` / `commit` / `rollback`), adquirindo uma conexão dedicada do pool com `connection.getConnection()`.

| Método                    | Descrição                                                                          |
|---------------------------|------------------------------------------------------------------------------------|
| `criarPedido`             | Insere pedido + itens em transação; verifica existência de cada produto via FK     |
| `listarPedidos`           | `SELECT * FROM pedidos`                                                            |
| `listarIDPedido`          | `SELECT * FROM pedidos WHERE idPedido = ?`                                         |
| `alterarStatusPedido`     | `UPDATE pedidos SET Status = ? WHERE idPedido = ?`                                 |
| `deletarPedido`           | Deleta itens do pedido e depois o pedido em transação                              |
| `listarItens`             | `SELECT * FROM itens_pedidos`                                                      |
| `listarIDItem`            | `SELECT * FROM itens_pedidos WHERE idItensPedidos = ?`                             |
| `listarItensPorPedido`    | `SELECT ... FROM itens_pedidos WHERE idPedido = ?`                                 |
| `alterarItem`             | Atualiza item em transação e retorna o `pedidoId` do item modificado               |
| `deletarItem`             | Deleta item em transação e retorna o `pedidoId` associado                          |
| `atualizarSubtotalPedido` | `UPDATE pedidos SET subTotal = ? WHERE idPedido = ?`                               |

---

### 7.4 Controllers

#### `categoria.controller.js`

| Método              | Validações                                                      | Resposta de sucesso |
|---------------------|-----------------------------------------------------------------|---------------------|
| `listarCategorias`  | —                                                               | 200                 |
| `listarIdCategoria` | `id` deve ser número positivo                                   | 200 / 404           |
| `criarCategoria`    | Usa `Categoria.criar()` — validação fica no model              | 201                 |
| `alterarCategoria`  | `id` positivo; `nome` e `descricao` não podem ser vazios        | 200                 |
| `deletarCategoria`  | Verifica se id existe antes de deletar                          | 200                 |

#### `produto.controller.js`

| Método          | Validações                                                      | Resposta de sucesso |
|-----------------|-----------------------------------------------------------------|---------------------|
| `listarProdutos`  | —                                                             | 200                 |
| `listarIdProduto` | `id` deve ser número positivo                                 | 200                 |
| `criarProdutos`   | `req.file` obrigatório; restante validado pelo model          | 201                 |
| `alterarProduto`  | `id` positivo; produto deve existir; `req.file` obrigatório   | 200                 |
| `deletarProduto`  | Verifica existência do id antes de deletar                    | 200                 |

#### `pedido.controller.js`

| Método            | Descrição                                                                       |
|-------------------|---------------------------------------------------------------------------------|
| `listarPedidos`   | Lista todos os pedidos                                                          |
| `listarIDPedidos` | Busca pedido por id                                                             |
| `criarPedido`     | Recebe array `itens`, instancia `ItensPedido` para cada um, calcula subtotal via `calcularSubTotal`, e persiste pedido + itens em transação |
| `atualizarPedido` | Valida status contra o enum e atualiza o campo `status`                        |
| `deletarPedido`   | Verifica existência e deleta pedido (com seus itens) em transação              |
| `listarItens`     | Lista todos os itens de pedido                                                 |
| `listarIDItem`    | Busca item de pedido por id                                                    |
| `alterarItem`     | Atualiza item, busca itens do pedido, recalcula subtotal e atualiza o pedido   |

#### `imagemProduto.controller.js`

Serve arquivos estáticos de imagem. Monta o caminho absoluto do arquivo em `uploads/images/<nome>` e usa `res.sendFile`. Retorna 404 se o arquivo não existir.

---

### 7.5 Routes

#### `src/routes/router.js` — Roteador raiz

| Prefixo        | Sub-roteador              |
|----------------|---------------------------|
| `/produtos`    | `produtos.routes.js`      |
| `/categorias`  | `categoria.routes.js`     |
| `/pedidos`     | `pedido.routes.js`        |
| `/images`      | `imagemProduto.routes.js` |

#### Mapeamento completo de rotas

| Método   | Rota                         | Controller / Action         |
|----------|------------------------------|-----------------------------|
| GET      | `/categorias`                | `listarCategorias`          |
| GET      | `/categorias/:id`            | `listarIdCategoria`         |
| POST     | `/categorias`                | `criarCategoria`            |
| PUT      | `/categorias/:id`            | `alterarCategoria`          |
| DELETE   | `/categorias/:id`            | `deletarCategoria`          |
| GET      | `/produtos`                  | `listarProdutos`            |
| GET      | `/produtos/:id`              | `listarIdProduto`           |
| POST     | `/produtos`                  | `uploadImage` → `criarProdutos`   |
| PUT      | `/produtos/:id`              | `uploadImage` → `alterarProduto`  |
| DELETE   | `/produtos/:id`              | `deletarProduto`            |
| GET      | `/pedidos`                   | `listarPedidos`             |
| GET      | `/pedidos/:id`               | `listarIDPedidos`           |
| POST     | `/pedidos`                   | `criarPedido`               |
| PUT      | `/pedidos/:id`               | `atualizarPedido`           |
| DELETE   | `/pedidos/:id`               | `deletarPedido`             |
| GET      | `/pedidos/itens`             | `listarItens`               |
| GET      | `/pedidos/itens/:id`         | `listarIDItem`              |
| PUT      | `/pedidos/itens/:id`         | `alterarItem`               |
| GET      | `/images/produto/:nome`      | `exibirImagem`              |

---

### 7.6 Middlewares

#### `src/middlewares/uploadImage.js`

Instancia o Multer usando a fábrica `createMulter` com as seguintes configurações:

| Config         | Valor                           |
|----------------|---------------------------------|
| Pasta destino  | `uploads/images/`               |
| MIME aceitos   | `image/jpeg`, `image/png`       |
| Tamanho máximo | 10 MB (10 × 1024 × 1024 bytes) |
| Campo no form  | `image` (single upload)         |

O middleware é aplicado nas rotas `POST /produtos` e `PUT /produtos/:id` antes do controller, disponibilizando `req.file` com os dados do arquivo salvo.

---

### 7.7 Enums

#### `src/enum/statusPedido.enum.js`

```js
export const statusPedido = {
  ABERTO: "Aberto",
  FINALIZADO: "Finalizado",
  PENDENTE: "Pendente",
};
```

Centraliza os valores válidos do campo `status` da tabela `pedidos`. Evita strings mágicas espalhadas pelo código e facilita a manutenção caso os valores do ENUM do banco sejam alterados.

---

## 8. Referência da API

**Base URL:** `https://market-7tm6.onrender.com` (produção) ou `http://localhost:<SERVER_PORT>` (local)

Todas as respostas são em `application/json`.

---

### 8.1 Categorias

#### `GET /categorias`

Lista todas as categorias.

**Resposta 200:**
```json
{
  "Data": [
    { "idCategoria": 1, "nome": "Eletrônicos", "descricao": "Aparelhos eletrônicos", "DataCad": "2025-01-01T..." }
  ]
}
```

Se não houver registros: `{ "Message": "Categorias não existem nessa tabela" }`

---

#### `GET /categorias/:id`

Busca uma categoria pelo id.

**Parâmetro:** `id` — inteiro positivo

**Resposta 200:** `{ "Data": [ {...} ] }`
**Resposta 400:** `{ "Message": "Digite um id válido" }`
**Resposta 404:** `{ "Message": "Esse id não existe" }`

---

#### `POST /categorias`

Cria uma nova categoria.

**Body (JSON):**
```json
{
  "nome": "Eletrônicos",
  "descricao": "Aparelhos eletrônicos em geral"
}
```

**Resposta 201:**
```json
{
  "Message": "Categoria criada",
  "Data": { "insertId": 1, "affectedRows": 1 }
}
```

---

#### `PUT /categorias/:id`

Atualiza uma categoria existente.

**Body (JSON):**
```json
{
  "nome": "Smartphones",
  "descricao": "Celulares e acessórios"
}
```

**Resposta 200:** `{ "Message": "Categoria alterada com sucesso", "Data": {...} }`
**Resposta 400:** `{ "Message": "Preencha os campos nome e descrição" }` ou `{ "Message": "Digite um id valido" }`

---

#### `DELETE /categorias/:id`

Remove uma categoria.

**Resposta 200:** `{ "Message": "Categoria deletada!", "Data": {...} }`
**Resposta 400:** `{ "Message": "Digite um id valido" }`

---

### 8.2 Produtos

> As rotas `POST` e `PUT` utilizam `multipart/form-data` pois enviam imagem.

#### `GET /produtos`

Lista todos os produtos.

**Resposta 200:**
```json
{
  "Message": "Produtos Listados:",
  "Data": [
    {
      "idProduto": 1,
      "idCategoria": 2,
      "nome": "iPhone 17 Pro Max",
      "descricao": "Smartphone Apple topo de linha",
      "preco": "7999.00",
      "Imagem": "uploads/images/a3f...-foto.jpg",
      "estoque": 10,
      "DataCad": "2025-01-01T..."
    }
  ]
}
```

---

#### `GET /produtos/:id`

Busca produto por id.

**Resposta 200:** `{ "Message": "Produto Encontrado:", "Data": [...] }`
**Resposta 400:** `{ "Message": "Digite um id válido" }`

---

#### `POST /produtos`

Cria um produto com imagem.

**Content-Type:** `multipart/form-data`

| Campo        | Tipo    | Obrigatório | Descrição                     |
|--------------|---------|-------------|-------------------------------|
| `idCategoria`| number  | Sim         | ID da categoria               |
| `nome`       | string  | Sim         | Nome (3–45 chars)             |
| `descricao`  | string  | Sim         | Descrição (5–100 chars)       |
| `preco`      | number  | Sim         | Preço decimal positivo        |
| `estoque`    | number  | Sim         | Quantidade em estoque (≥ 0)   |
| `image`      | arquivo | Sim         | JPEG ou PNG, até 10 MB        |

**Resposta 201:** `{ "Message": "Produto criado com sucesso", "Data": {...} }`
**Resposta 400:** `{ "message": "Arquivo de imagem não enviado" }`

---

#### `PUT /produtos/:id`

Atualiza um produto (mesmos campos do POST). O campo `image` é obrigatório.

**Resposta 200:** `{ "Message": "Produto alterado com sucesso", "Data": {...} }`
**Resposta 400:** `{ "Message": "Produto não encontrado" }` ou `{ "Message": "Digite um id válido" }`

---

#### `DELETE /produtos/:id`

Remove um produto.

**Resposta 200:** `{ "Message": "Produto deletado!", "Data": {...} }`
**Resposta 400:** `{ "Message": "Insira um Id válido" }`

---

### 8.3 Pedidos

#### `GET /pedidos`

Lista todos os pedidos.

**Resposta 201:** `{ "result": [...] }`

---

#### `GET /pedidos/:id`

Busca pedido por id.

**Resposta 201:** `{ "result": [...] }`

---

#### `POST /pedidos`

Cria um pedido com seus itens. O subtotal é calculado automaticamente pela model.

**Body (JSON):**
```json
{
  "itens": [
    { "idProduto": 1, "quantidade": 2, "valorItem": 7999.00 },
    { "idProduto": 3, "quantidade": 1, "valorItem": 299.90 }
  ]
}
```

O campo `status` é definido automaticamente como `"Aberto"`.

**Resposta 200:** `{ "result": { "insertId": 5, "affectedRows": 1 } }`
**Resposta 500:** produto inexistente ou erro no banco (rollback automático)

---

#### `PUT /pedidos/:id`

Atualiza o status de um pedido.

**Body (JSON):**
```json
{ "status": "Finalizado" }
```

Valores válidos: `"Aberto"`, `"Finalizado"`, `"Pendente"`

**Resposta 200:** `{ "result": {...} }`
**Resposta 400:** `{ "message": "Status inválido, informe Aberto, Finalizado ou Pendente" }`

---

#### `DELETE /pedidos/:id`

Remove um pedido e todos os seus itens (em transação).

**Resposta 200:** `{ "result": {...} }`
**Resposta 400:** `{ "message": "Id inválido." }` ou `{ "message": "Pedido não encontrado." }`

---

### 8.4 Itens de Pedido

#### `GET /pedidos/itens`

Lista todos os itens de pedido de todas as ordens.

**Resposta 200:** `{ "result": [...] }`

---

#### `GET /pedidos/itens/:id`

Busca um item de pedido pelo seu id.

**Resposta 200:** `{ "result": [...] }`

---

#### `PUT /pedidos/itens/:id`

Atualiza um item de pedido e recalcula o subtotal do pedido pai automaticamente.

**Body (JSON):**
```json
{
  "idProduto": 2,
  "quantidade": 3,
  "valorItem": 199.90
}
```

**Resposta 200:**
```json
{
  "pedidoId": 5,
  "novoSubtotal": 599.70
}
```

---

### 8.5 Imagens

#### `GET /images/produto/:nome`

Serve o arquivo de imagem de um produto diretamente.

**Parâmetro:** `:nome` — nome do arquivo (ex: `a3f1...9c-foto.jpg`)

**Resposta 200:** arquivo binário da imagem (JPEG ou PNG)
**Resposta 404:** `{ "message": "Imagem nao encontrada" }`

O caminho retornado nos produtos (campo `Imagem`) pode ser usado para montar a URL: `GET /images/produto/<nome_do_arquivo>`.

---

## 9. Upload de Imagens

O fluxo completo de upload de imagem é:

1. O cliente envia `multipart/form-data` com o campo `image`.
2. O middleware `uploadImage` (Multer) intercepta antes do controller.
3. O Multer valida o MIME type (`image/jpeg` ou `image/png`) e o tamanho (≤ 10 MB).
4. O arquivo é salvo em `uploads/images/<hash>-<nomeOriginal>`.
5. O controller usa `req.file.filename` para montar o caminho relativo `uploads/images/<filename>` e o salva no banco.
6. Para exibir a imagem, usa-se a rota `GET /images/produto/<filename>`.

---

## 10. Coleção Insomnia

O arquivo `docs/Deploy` é uma coleção do **Insomnia v5** (formato YAML) com todas as requisições já configuradas, incluindo exemplos de body com dados gerados automaticamente via Faker.

**Variáveis da coleção:**

| Variável  | Valor padrão | Descrição                     |
|-----------|--------------|-------------------------------|
| `server`  | (a definir)  | URL base (ex: `http://localhost`) |
| `port`    | (a definir)  | Porta do servidor             |

Para importar: abra o Insomnia → **Import** → selecione o arquivo `docs/Deploy`.

---

## 11. Deploy

O projeto é hospedado no **Render** (plano gratuito). URL pública: `https://market-7tm6.onrender.com`.

**Observações sobre o ambiente de produção:**

- A conexão com o banco usa `ssl: { rejectUnauthorized: false }` para compatibilidade com bancos gerenciados (ex: PlanetScale, Aiven, Render MySQL).
- A pasta `uploads/images/` precisa existir no servidor (o Multer cria automaticamente se ausente).
- O banco de dados deve ser criado e populado com as tabelas antes do primeiro boot (ver seção 5).
- A inicialização automática do banco (`initializeDatabase`) está disponível mas comentada no código.

---

## 12. Decisões de Design

### Singleton de conexão

A classe `Database` garante que apenas um pool de conexões seja criado durante o ciclo de vida da aplicação, evitando que múltiplos módulos criem pools redundantes.

### Factory Methods nos Models

Os métodos estáticos `criar` e `editar` nas classes de model centralizam a lógica de instanciação. O controller não precisa conhecer o construtor da classe, apenas passar os dados brutos. Além disso, as validações nos setters são disparadas automaticamente durante a construção.

### Transações explícitas no Repository

Operações como `criarPedido`, `deletarPedido` e `alterarItem` adquirem uma conexão dedicada do pool e usam `beginTransaction` / `commit` / `rollback`. Isso garante **atomicidade**: se qualquer etapa falhar (ex: produto não existe), nenhuma alteração é persistida.

### Enum de status

O objeto `statusPedido` evita strings soltas espalhadas pelo código. O controller valida o valor recebido comparando com as constantes do enum antes de chamar o repository.

### Fábrica do Multer

A função `createMulter` permite criar instâncias do Multer com configurações diferentes para cada tipo de upload (imagens, documentos, etc.) sem duplicar código. Atualmente só há a instância para imagens, mas a estrutura facilita extensões futuras.

---

*Documentação gerada em junho de 2026.*
