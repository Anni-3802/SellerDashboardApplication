import { pool } from "../db.js";
import client from "../cache.js";
import dotenv from "dotenv";
dotenv.config();

const CACHE_TTL = process.env.CACHE_TTL || 30; // seconds

export async function getSellerSummary(sellerId) {
  const cacheKey = `seller_summary_${sellerId}`;
  const cachedData = await client.get(cacheKey);
  if (cachedData) return JSON.parse(cachedData);

  const query = `
    SELECT
      s.name AS seller_name,
      COALESCE(SUM(CASE WHEN date >= $2 AND date <= $3 THEN quantity ELSE 0 END),0) AS this_week_qty,
      COALESCE(SUM(CASE WHEN date >= $2 AND date <= $3 THEN quantity * price ELSE 0 END),0) AS this_week_revenue,
      COALESCE(SUM(CASE WHEN date >= $2 AND date <= $3 AND returned = TRUE THEN quantity ELSE 0 END),0) AS this_week_returns,
      COALESCE(SUM(CASE WHEN date >= $4 AND date <= $5 THEN quantity ELSE 0 END),0) AS last_week_qty
    FROM sellers s
    LEFT JOIN sales ON sales.seller_id = s.id
    WHERE s.id = $1
    GROUP BY s.name;
  `;

  const today = new Date();
  const day = today.getDay();
  const diff = (day === 0 ? 6 : day - 1);
  const startOfThisWeek = new Date(today);
  startOfThisWeek.setDate(today.getDate() - diff);
  const endOfThisWeek = new Date(startOfThisWeek);
  endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
  const endOfLastWeek = new Date(startOfThisWeek);
  endOfLastWeek.setDate(startOfThisWeek.getDate() - 1);

  const values = [
    sellerId,
    startOfThisWeek.toISOString().split("T")[0],
    endOfThisWeek.toISOString().split("T")[0],
    startOfLastWeek.toISOString().split("T")[0],
    endOfLastWeek.toISOString().split("T")[0],
  ];

  const result = await pool.query(query, values);
  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const thisWeekQty = parseInt(row.this_week_qty);
  const lastWeekQty = parseInt(row.last_week_qty);
  const returnRate = thisWeekQty === 0 ? 0 : (row.this_week_returns * 100.0) / thisWeekQty;

  const alerts = [];
  if (lastWeekQty > 0) {
    const dropPercent = ((lastWeekQty - thisWeekQty) * 100.0) / lastWeekQty;
    if (dropPercent > 30) alerts.push("Sales dropped by more than 30% vs last week");
  }
  if (returnRate > 10) alerts.push("Return rate above 10%");

  const summary = {
    sellerId: sellerId,
    sellerName: row.seller_name,
    totalSalesThisWeek: thisWeekQty,
    totalRevenueThisWeek: Number(row.this_week_revenue).toFixed(2),
    returnRate: Number(returnRate.toFixed(2)),
    alerts,
  };

  await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(summary));
  return summary;
}
