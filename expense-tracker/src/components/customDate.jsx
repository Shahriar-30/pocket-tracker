import { useState } from "react";

// Helper to format DD/MM/YYYY
function formatDMY(iso) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

// Helper to get today's date in ISO format
function today() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
}

export default function CustomDateInput({ value, onChange }) {
  const [showPicker, setShowPicker] = useState(false);

  const handleSelectToday = () => {
    onChange(today());
    setShowPicker(false);
  };

  const handleManualSelect = (e) => {
    onChange(e.target.value);
    setShowPicker(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <input
        type="text"
        readOnly
        value={formatDMY(value)}
        placeholder="DD/MM/YYYY"
        onClick={() => setShowPicker(!showPicker)}
        style={{ cursor: "pointer", padding: "8px" }}
      />
      {showPicker && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            background: "#fff",
            border: "1px solid #ccc",
            padding: "8px",
            zIndex: 100,
            borderRadius: "6px",
          }}
        >
          {/* Today Button */}
          <button onClick={handleSelectToday} style={{ marginBottom: "8px" }}>
            Today ({formatDMY(today())})
          </button>
          <br />
          {/* Optional native calendar for manual selection */}
          <input type="date" value={value} onChange={handleManualSelect} />
        </div>
      )}
    </div>
  );
}
