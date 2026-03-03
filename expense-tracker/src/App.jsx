import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ExpenseProvider } from "./context/ExpenseContext";
import RoleSelect from "./pages/RoleSelect";
import AddExpense from "./pages/AddExpense";
import History from "./pages/History";

export default function App() {
  return (
    <ExpenseProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleSelect />} />
          <Route path="/add" element={<AddExpense />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ExpenseProvider>
  );
}
