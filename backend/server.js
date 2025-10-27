import express from "express";
import dotenv from "dotenv";
import sellerRoute from "./routes/sellerRoute.js";
import cors from "cors";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/seller", sellerRoute);

app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});
