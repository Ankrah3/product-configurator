import express from "express";
import {
  getProductInfo,
  saveConfiguration,
  getConfigurations,
  deleteConfiguration,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/product", getProductInfo);
router.post("/config", saveConfiguration);
router.get("/configurations", getConfigurations);
router.delete("/configurations/:id", deleteConfiguration);

export default router;
