import mongoose from "mongoose";

let expenseSchema = new mongoose.Schema(
  {
    date: String,
    title: String,
    amount: Number,
    method: String,
    description: String,
  },
  { timestamps: true },
);

export let Expense = mongoose.model("Expense", expenseSchema);
