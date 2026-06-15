import createMulter from "../config/Multer.js";

const uploadImage = createMulter({
  folder: "images",
  allowedTypes: ["image/jpeg", "image/png"],
  fileSize: 10 * 1024 * 1024, //10 MB
}).single("image");

export default uploadImage;