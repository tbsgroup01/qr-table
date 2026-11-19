import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "../../");
const baseUploadDir = path.join(serverRoot, "uploads");
const dishesDir = path.join(baseUploadDir, "dishes");
const profilesDir = path.join(baseUploadDir, "profiles");

[baseUploadDir, dishesDir, profilesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/svg+xml",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, png, jpg, webp, svg) are allowed!"), false);
  }
};

const createStorage = (subDir = "") =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const targetDir = subDir ? path.join(baseUploadDir, subDir) : baseUploadDir;
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const cleanName = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toLowerCase();
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
    },
  });

export const uploadDish = multer({
  storage: createStorage("dishes"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadProfile = multer({
  storage: createStorage("profiles"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const upload = multer({
  storage: createStorage(""),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
