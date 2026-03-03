import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "../context/ExpenseContext";
import axios from "axios";
import "./AddExpense.css";

const METHODS = ["Bkash", "Nagad", "Card"];
const METHOD_META = {
  Bkash: { color: "#E2136E", light: "#fce7f3", emoji: "📱" },
  Nagad: { color: "#F6841F", light: "#fff7ed", emoji: "🔶" },
  Card: { color: "#2563EB", light: "#eff6ff", emoji: "💳" },
};

// Helper: get today in local ISO format (YYYY-MM-DD)
function today() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
}

// Helper: format ISO date to DD/MM/YYYY for display
function formatDMY(iso) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export default function AddExpense() {
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { expenses, role, addExpense, setAllExpenses } = useExpenses();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/all_expence`);

        setAllExpenses(data.data); // Replace state
      } catch (err) {
        alert("=== = Error");
        console.log(err);
      }
    };

    fetchData();
  }, []);

  const [form, setForm] = useState({
    date: today(),
    title: "",
    amount: "",
    method: "Bkash",
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const now = new Date();
  const thisMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });
  const monthTotal = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      errs.amount = "Enter a valid amount";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    addExpense({ ...form, amount: parseFloat(form.amount) });
    setSubmitted(true);
    setErrors({});
    await axios
      .post(`${API_URL}/add_expense`, {
        title: form.title,
        date: form.date,
        amount: form.amount,
        method: form.method,
        description: form.description,
      })
      .then(() => console.log("added"))
      .catch((err) => alert("==== = Error ;)"))
      .finally(() => {
        setSubmitted(false);
        setForm({
          date: today(),
          title: "",
          amount: "",
          method: "Bkash",
          description: "",
        });
      });
  };

  return (
    <div className="add-page">
      {/* Top Nav */}
      <nav className="add-nav">
        <button className="nav-back" onClick={() => navigate("/")}>
          ← Back
        </button>
        <div className="nav-title">
          <span>🧒</span>
          <span>Add Expense</span>
        </div>
        <button className="nav-history" onClick={() => navigate("/history")}>
          📋 History
        </button>
      </nav>

      {/* Monthly Summary Banner */}
      <div className="month-banner">
        <div className="banner-left">
          <div className="banner-label">Spent this month</div>
          <div className="banner-amount">৳{monthTotal.toFixed(2)}</div>
          <div className="banner-sub">
            {thisMonthExpenses.length} transactions
          </div>
        </div>
        <div className="banner-right">
          <div className="banner-month">
            {MONTHS[now.getMonth()]} {now.getFullYear()}
          </div>
          <div className="banner-bar">
            <div
              className="banner-fill"
              style={{ width: `${Math.min(100, (monthTotal / 9000) * 100)}%` }}
            />
          </div>
          <div className="banner-hint">of ৳9,000 budget</div>
        </div>
      </div>

      {/* Form Card */}
      <div className="form-card">
        <h3 className="form-title">New Expense</h3>

        {/* Date + Amount row */}
        <div className="field-row">
          <div className="field" style={{ flex: 1 }}>
            <label className="field-label">📅 Date</label>
            <input
              type="date"
              className={`field-input ${errors.date ? "error" : ""}`}
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
            {/* Display DD/MM/YYYY */}
            {form.date && (
              <small style={{ paddingLeft: 20 }} className="date-preview">
                MM,DD,YYYY
              </small>
            )}
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label className="field-label">৳ Amount</label>
            <input
              type="number"
              className={`field-input ${errors.amount ? "error" : ""}`}
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => {
                setForm((f) => ({ ...f, amount: e.target.value }));
                setErrors((er) => ({ ...er, amount: null }));
              }}
            />
            {errors.amount && (
              <span className="error-msg">{errors.amount}</span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="field">
          <label className="field-label">✏️ Title</label>
          <input
            type="text"
            className={`field-input ${errors.title ? "error" : ""}`}
            placeholder="e.g. School lunch, Rickshaw..."
            value={form.title}
            onChange={(e) => {
              setForm((f) => ({ ...f, title: e.target.value }));
              setErrors((er) => ({ ...er, title: null }));
            }}
          />
          {errors.title && <span className="error-msg">{errors.title}</span>}
        </div>

        {/* Payment Method */}
        <div className="field">
          <label className="field-label">💳 Payment Method</label>
          <div className="method-grid">
            {METHODS.map((m) => (
              <button
                key={m}
                className={`method-btn ${form.method === m ? "active" : ""}`}
                style={
                  form.method === m
                    ? {
                        background: METHOD_META[m].color,
                        borderColor: METHOD_META[m].color,
                        color: "#fff",
                        boxShadow: `0 4px 16px ${METHOD_META[m].color}55`,
                      }
                    : {}
                }
                onClick={() => setForm((f) => ({ ...f, method: m }))}
              >
                <span>{METHOD_META[m].emoji}</span>
                <span>{m}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="field">
          <label className="field-label">
            📝 Description <span className="optional">(optional)</span>
          </label>
          <textarea
            className="field-input field-textarea"
            placeholder="Any extra notes about this expense..."
            value={form.description}
            rows={3}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>

        {/* Submit */}
        <button
          className={`submit-btn ${submitted ? "submitted" : ""}`}
          onClick={handleSubmit}
        >
          {submitted ? (
            <span className="submit-success">Loading...!</span>
          ) : (
            <span>Submit Expense →</span>
          )}
        </button>
      </div>
    </div>
  );
}
