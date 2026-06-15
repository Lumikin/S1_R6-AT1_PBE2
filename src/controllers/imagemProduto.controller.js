import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); // Obtém o caminho absoluto do arquivo atual
const __dirname = path.dirname(__filename); // Diretório do arquivo atual

// Controller responsável por servir imagens de produto a partir do diretório uploads/images.

const imagemProduto = {
  exibirImagem: async (req, res) => {
    try {
      const { nome } = req.params;
      const caminhoAbsoluto = path.join(
        __dirname,
        "../../uploads/images/",
        nome,
      ); // Monta o caminho absoluto da imagem combinando o diretório atual

      return res.sendFile(caminhoAbsoluto, (error) => {
        if (error) {
          res.status(404).json({
            message: "Imagem nao encontrada",
          });
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Ocorreu um erro no servidor",
      });
    }
  },
};
export default imagemProduto;
