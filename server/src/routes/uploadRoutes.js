import express from "express";
import { uploadDish, uploadProfile, upload } from "../config/multer.js";

const router = express.Router();

const getFileUrl = (req, subFolder, filename) => {
  const protocol = req.protocol;
  const host = req.get("host");
  const subPath = subFolder ? `uploads/${subFolder}/${filename}` : `uploads/${filename}`;
  return `${protocol}://${host}/${subPath}`;
};

const handleUpload = (uploader, subFolder) => (req, res) => {
  uploader.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload error",
      });
    }

    const uploadedFile =
      req.files?.["image"]?.[0] ||
      req.files?.["file"]?.[0] ||
      req.files?.["photo"]?.[0] ||
      req.file;

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    const fileUrl = getFileUrl(req, subFolder, uploadedFile.filename);

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      url: fileUrl,
      relativePath: subFolder
        ? `/uploads/${subFolder}/${uploadedFile.filename}`
        : `/uploads/${uploadedFile.filename}`,
      filename: uploadedFile.filename,
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype,
    });
  });
};

router.post("/dish", handleUpload(uploadDish, "dishes"));
router.post("/profile", handleUpload(uploadProfile, "profiles"));
router.post("/", handleUpload(upload, ""));

export default router;
