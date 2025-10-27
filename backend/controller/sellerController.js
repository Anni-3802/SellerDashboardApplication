import { getSellerSummary } from "../services/sellerService.js";
import { success, notFound, error } from "../utils/responseHandler.js";
import { pool } from "../db.js";

export async function getSummary(req, res) {
  try {
    const sellerId = req.params.id;
    const data = await getSellerSummary(sellerId);
    if (!data) return notFound(res, "Seller not found");
    return success(res, data);
  } catch (err) {
    console.error(err);
    return error(res);
  }
}

export async function listSellers(req, res) {
  try {
    const result = await pool.query("SELECT id, name FROM sellers");
    return success(res, result.rows);
  } catch (err) {
    console.error(err);
    return error(res);
  }
}
