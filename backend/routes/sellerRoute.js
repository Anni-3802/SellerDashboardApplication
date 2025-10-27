import express from "express";
import { getSummary, listSellers } from "../controller/sellerController.js";

const router = express.Router();
router.get("/list", listSellers);
router.get("/:id/summary", getSummary);

export default router;
