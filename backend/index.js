import express from "express";
import fs from "fs/promises";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Expense } from "./expense.modul.js";

dotenv.config();

const app = express();
const FILE = "database/data.json";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const ensureFile = async () => {
  try {
    await fs.access(FILE);
  } catch {
    await fs.mkdir("database", { recursive: true });
    await fs.writeFile(FILE, JSON.stringify([]));
  }
};

app.post("/add_expense", async (req, res) => {
  try {
    const { date, title, amount, method, description } = req.body;

    if (!(date || title || amount || method)) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    await ensureFile();

    let newExpence = await Expense.create({
      date,
      title,
      amount,
      method,
      description,
    });

    res.status(201).json({ message: "New expense added", data: newExpence });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/all_expence", async (req, res) => {
  try {
    await ensureFile();

    let data = await Expense.find({});

    res.status(200).json({ message: "Got all expences", data });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

const port = process.env.PORT || 8080;

await mongoose
  .connect(process.env.MONGODB_URL)
  .then(async () => {
    await app.listen(port, () => console.log("server started " + port));
  })
  .catch((err) => console.log("mongodb error"));
