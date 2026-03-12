import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import RobinhoodKISS from "./pages/RobinhoodKISS";

const companies = [
  { ticker: "HOOD", name: "Robinhood", path: "/robinhood",
    description: "2030 Earnings KISS Model · Interactive", color: "#00DC82" },
];

function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "#0B0E11", color: "#E8ECF1",
      fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 40 }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Interactive Models</h1>
      <p style={{ color: "#7A8699", marginBottom: 40 }}>Select a company to explore</p>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        {companies.map(c => (
          <Link key={c.ticker} to={c.path} style={{ textDecoration: "none" }}>
            <div style={{
              width: 260, padding: 24, background: "#1A1F27", borderRadius: 12,
              border: "1px solid #2A3140", cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#2A3140"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.ticker}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#E8ECF1", marginBottom: 8 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "#7A8699" }}>{c.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/robinhood" element={<RobinhoodKISS />} />
      </Routes>
    </BrowserRouter>
  );
}
