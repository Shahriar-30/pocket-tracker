import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "../context/ExpenseContext";
import "./History.css";
import axios from "axios";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const METHOD_COLORS = {
  Bkash: { bg: "#E2136E", light: "#fce7f3" },
  Nagad: { bg: "#F6841F", light: "#fff7ed" },
  Card: { bg: "#2563EB", light: "#eff6ff" },
};

function generateReport(expenses, month, year) {
  const monthName = MONTHS[month];
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byMethod = {};
  expenses.forEach((e) => {
    byMethod[e.method] = (byMethod[e.method] || 0) + e.amount;
  });

  const lines = [
    "╔══════════════════════════════════════╗",
    `║       POCKET TRACKER REPORT          ║`,
    `║       ${monthName} ${year}${" ".repeat(Math.max(0, 23 - monthName.length - String(year).length))}║`,
    "╚══════════════════════════════════════╝",
    "",
    `Total Spent: ৳${total.toFixed(2)}`,
    `Transactions: ${expenses.length}`,
    "",
    "── By Payment Method ──",
    ...Object.entries(byMethod).map(([m, amt]) => `  ${m}: ৳${amt.toFixed(2)}`),
    "",
    "── Transactions ──",
    ...expenses.map(
      (e) =>
        `\n  ${e.date}\n  ${e.title}\n  ৳${e.amount.toFixed(2)} via ${e.method}${e.description ? `\n  Note: ${e.description}` : ""}\n  ${"─".repeat(30)}`,
    ),
  ];
  return lines.join("\n");
}

export default function History() {
  const navigate = useNavigate();
  const { expenses, role, addExpense, setAllExpenses } = useExpenses();
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const years = [
    now.getFullYear() - 1,
    now.getFullYear(),
    now.getFullYear() + 1,
  ];

  const fetchData = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const { data } = await axios.get(`${API_URL}/all_expence`);

      setAllExpenses(data.data); // Replace state
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(
    () =>
      expenses
        .filter((e) => {
          const d = new Date(e.date + "T00:00:00");
          return (
            d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
          );
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [expenses, selectedMonth, selectedYear],
  );

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const byMethod = useMemo(() => {
    const acc = {};
    filtered.forEach((e) => {
      acc[e.method] = (acc[e.method] || 0) + e.amount;
    });
    return acc;
  }, [filtered]);

  // Group by date
  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach((e) => {
      if (!g[e.date]) g[e.date] = [];
      g[e.date].push(e);
    });
    return Object.entries(g).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [filtered]);

  // const handleDownload = () => {
  //   const content = generateReport(filtered, selectedMonth, selectedYear);
  //   const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `expenses_${MONTHS[selectedMonth]}_${selectedYear}.txt`;
  //   a.click();
  //   URL.revokeObjectURL(url);
  // };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="history-page">
      {/* Nav */}
      <nav className="history-nav">
        <button
          className="h-nav-back"
          onClick={() => navigate(role === "parent" ? "/" : "/add")}
        >
          ← Back
        </button>
        <div className="h-nav-title">
          <span>{role === "parent" ? "👨‍👩‍👧" : "🧒"}</span>
          <span>{role === "parent" ? "Family Expenses" : "My History"}</span>
        </div>
        {role === "child" && (
          <button className="h-nav-add" onClick={() => navigate("/add")}>
            + Add
          </button>
        )}
        {role === "parent" && <div style={{ width: 60 }} />}
      </nav>

      <div className="history-inner">
        {/* Filters */}
        <div className="filter-card">
          <div className="filter-row">
            <div className="filter-field">
              <label className="filter-label">MONTH</label>
              <select
                className="filter-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-field">
              <label className="filter-label">YEAR</label>
              <select
                className="filter-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary */}
          <div
            className="summary-bar"
            style={{ display: "flex", flexDirection: "column" }}
          >
            <div className="summary-total">
              <div className="summary-label">Total Spent</div>
              <div>
                <div className="summary-amount">৳{total.toFixed(2)}</div>
                <div className="summary-count">
                  {filtered.length} transactions
                </div>
              </div>
            </div>
            <div className="summary-methods">
              {Object.entries(byMethod).map(([m, amt]) => (
                <div
                  key={m}
                  className="method-pill"
                  style={{
                    background: METHOD_COLORS[m]?.light || "#f5f5f4",
                    color: METHOD_COLORS[m]?.bg || "#666",
                  }}
                >
                  <span>{m}</span>
                  <span>৳{amt.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* <button className="download-btn" onClick={handleDownload}>
            ⬇️ Download {MONTHS[selectedMonth]} Report
          </button> */}
        </div>

        {/* Expense list */}
        {grouped.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No expenses found</div>
            <div className="empty-sub">
              No records for {MONTHS[selectedMonth]} {selectedYear}
            </div>
            {role === "child" && (
              <button
                className="empty-add-btn"
                onClick={() => navigate("/add")}
              >
                + Add your first expense
              </button>
            )}
          </div>
        ) : (
          grouped.map(([date, items]) => (
            <div key={date} className="date-group">
              <div className="date-header">
                <span className="date-label">{formatDate(date)}</span>
                <span className="date-total">
                  ৳{items.reduce((s, e) => s + e.amount, 0).toFixed(2)}
                </span>
              </div>
              {items.map((e) => (
                <div key={e._id} className="expense-card">
                  <div
                    className="expense-stripe"
                    style={{
                      background: METHOD_COLORS[e.method]?.bg || "#ccc",
                    }}
                  />
                  <div className="expense-body">
                    <div className="expense-top">
                      <span className="expense-title">{e.title}</span>
                      <span className="expense-amount">
                        ৳{e.amount.toFixed(2)}
                      </span>
                    </div>
                    {e.description && (
                      <div className="expense-desc">{e.description}</div>
                    )}
                    <div className="expense-meta">
                      <span
                        className="expense-method-tag"
                        style={{
                          background:
                            METHOD_COLORS[e.method]?.light || "#f5f5f4",
                          color: METHOD_COLORS[e.method]?.bg || "#666",
                        }}
                      >
                        {e.method}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
