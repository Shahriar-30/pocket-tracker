import { useNavigate } from "react-router-dom";
import { useExpenses } from "../context/ExpenseContext";
import "./RoleSelect.css";

export default function RoleSelect() {
  const navigate = useNavigate();
  const { setRole } = useExpenses();

  const handleSelect = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === "child") {
      navigate("/add");
    } else {
      navigate("/history");
    }
  };

  return (
    <div className="role-page">
      {/* Decorative blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="role-content">
        <div className="logo-section">
          <div className="logo-icon">
            <span>💰</span>
          </div>
          <h1 className="logo-title">Pocket Tracker</h1>
          <p className="logo-subtitle">Family expense manager</p>
        </div>

        <p className="select-label">Who are you today?</p>

        <div className="role-cards">
          <button className="role-card role-child" onClick={() => handleSelect("child")}>
            <div className="role-emoji">🧒</div>
            <div className="role-name">Child</div>
            <div className="role-desc">Track my spending</div>
            <div className="role-arrow">→</div>
          </button>

          <button className="role-card role-parent" onClick={() => handleSelect("parent")}>
            <div className="role-emoji">👨‍👩‍👧</div>
            <div className="role-name">Parent</div>
            <div className="role-desc">View all expenses</div>
            <div className="role-arrow">→</div>
          </button>
        </div>

        <p className="footer-note">No account needed · Data stays on device</p>
      </div>
    </div>
  );
}
