const express = require("express");
const multer = require("multer");

const {
  uploadFile,
  getFiles,
  deleteFile
} = require("../controllers/mediaController");

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage
});

router.post("/upload", upload.single("file"), uploadFile);

router.get("/files", getFiles);

router.delete("/files/:key", deleteFile);

module.exports = router;