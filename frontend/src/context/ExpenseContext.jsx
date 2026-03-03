import { createContext, useContext, useState } from "react";

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [role, setRole] = useState(null);

  const setAllExpenses = (data) => {
    setExpenses(data);
  };

  const addExpense = (expense) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  // const addExpense = (newData) => {
  //   setExpenses(
  //     (prev) =>
  //       Array.isArray(newData)
  //         ? [...newData, ...prev] // if array
  //         : [newData, ...prev], // if single object
  //   );
  // };

  return (
    <ExpenseContext.Provider
      value={{ expenses, addExpense, role, setRole, setAllExpenses }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  return useContext(ExpenseContext);
}
