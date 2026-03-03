import express from "express";
import fs from "fs/promises";
import cors from "cors";
import dotenv from "dotenv";

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

    const dataString = await fs.readFile(FILE, "utf8");
    const data = JSON.parse(dataString);

    data.push({
      id: Date.now(),
      date,
      title,
      amount: Number(amount),
      method,
      description: description || "",
      createdBy: "arafat",
    });

    await fs.writeFile(FILE, JSON.stringify(data, null, 2));

    res.status(201).json({ message: "New expense added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/all_expence", async (req, res) => {
  try {
    await ensureFile();

    let dataString = await fs.readFile(FILE, "utf8");
    let data = await JSON.parse(dataString);

    res.status(200).json({ message: "Got all expences", data });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log("server started " + port));
