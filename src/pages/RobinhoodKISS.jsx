import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Line, Area, AreaChart, Cell, CartesianGrid, PieChart, Pie,
} from "recharts";

/* ─────────────────────── COLOUR SYSTEM ─────────────────────── */
const C = {
  bg:       "#0B0E11",
  panel:    "#13171D",
  card:     "#1A1F27",
  border:   "#2A3140",
  text:     "#E8ECF1",
  dim:      "#7A8699",
  accent:   "#00DC82",     // Robinhood green
  accentDim:"#00DC8244",
  warn:     "#FF6B6B",
  gold:     "#FFD700",
  blue:     "#4C9AFF",
  purple:   "#A78BFA",
  orange:   "#FF9F43",
  cyan:     "#22D3EE",
  pink:     "#F472B6",
  teal:     "#2DD4BF",
  chart1:   "#00DC82",
  chart2:   "#4C9AFF",
  chart3:   "#FFD700",
  chart4:   "#A78BFA",
  chart5:   "#FF9F43",
  chart6:   "#F472B6",
  up:       "#00DC82",
  down:     "#FF6B6B",
};

/* ─────────────────────── BASE YEAR (2025A) ─────────────────── */
const FY25 = {
  avgClientAssets:   272.5875,    // $bn
  transRoca:         0.009095,    // transactional ROCA
  transRevenue:      2479.25,     // $M
  avgIEA:            55372.25,    // $M
  ieaPct:            0.2031,      // IEA as % of avg client assets
  nim:               0.02731,     // NIM
  nii:               1512,        // net interest income $M
  pmRevenue:         148.75,      // prediction markets $M
  goldOther:         331,         // RH Gold & others $M
  otherRevenue:      479.75,      // $M
  revenue:           4471,        // $M
  opex:              2074,        // adj opex $M
  pretax:            2397,        // $M
  netIncome:         2155.45,     // $M
  fdso:              914.49,      // M shares
  eps:               2.357,       //
  stockPrice:        75.86,       // as of model date
};

const HIST = {
  2022: { revenue: 1358, netIncome: -373, assets: 75.5,  transRev: 814, nii: 424, other: 120, pmRev: 0,    opex: 1715, eps: -0.39 },
  2023: { revenue: 1865, netIncome: 343,  assets: 84.0,  transRev: 785, nii: 929, other: 151, pmRev: 0,    opex: 1530, eps: 0.35  },
  2024: { revenue: 2951, netIncome: 1814, assets: 142.3, transRev: 1647, nii: 1109, other: 195, pmRev: 0,  opex: 1593, eps: 2.00  },
  2025: { revenue: 4471, netIncome: 2155, assets: 272.6, transRev: 2479, nii: 1512, other: 331, pmRev: 149, opex: 2074, eps: 2.36  },
};

/* ─────────────────────── HELPER COMPONENTS ─────────────────── */
const fmt = (v, type) => {
  if (v == null || isNaN(v)) return "—";
  switch (type) {
    case "$":   return `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    case "$B":  return `$${v.toFixed(1)}B`;
    case "$M":  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}M`;
    case "$d":  return `$${v.toFixed(2)}`;
    case "%":   return `${(v * 100).toFixed(1)}%`;
    case "%0":  return `${(v * 100).toFixed(0)}%`;
    case "bps": return `${(v * 10000).toFixed(0)} bps`;
    case "x":   return `${v.toFixed(1)}x`;
    case "#":   return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
    case "#1":  return v.toLocaleString("en-US", { maximumFractionDigits: 1 });
    default:    return String(v);
  }
};

function Slider({ label, value, set, min, max, step, fmtType, note }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{label}</span>
        <span style={{ color: C.accent, fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
          {fmt(value, fmtType)}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => set(+e.target.value)}
        style={{
          width: "100%", height: 6, appearance: "none", background:
            `linear-gradient(to right, ${C.accent} ${pct}%, ${C.border} ${pct}%)`,
          borderRadius: 3, outline: "none", cursor: "pointer",
        }}
      />
      {note && <div style={{ color: C.dim, fontSize: 11, marginTop: 2 }}>{note}</div>}
    </div>
  );
}

function KPICard({ title, value, subtitle, color, wide }) {
  return (
    <div style={{
      background: C.card, borderRadius: 10, padding: "16px 20px",
      border: `1px solid ${C.border}`, flex: wide ? "1 1 220px" : "1 1 150px",
      minWidth: wide ? 200 : 140,
    }}>
      <div style={{ color: C.dim, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{title}</div>
      <div style={{ color: color || C.text, fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      {subtitle && <div style={{ color: C.dim, fontSize: 11, marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 style={{ color: C.text, fontSize: 16, fontWeight: 600, margin: "32px 0 16px", letterSpacing: 0.3,
      borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
      {children}
    </h3>
  );
}

const tooltipStyle = {
  contentStyle: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text },
  labelStyle: { color: C.dim },
};

/* ─────────────────────── MAIN COMPONENT ─────────────────────── */
export default function RobinhoodKISS() {
  /* ── Slider state (defaults = Med scenario from Excel) ── */
  const [mktApprec, setMktApprec]       = useState(0.08);
  const [netNewGrowth, setNetNewGrowth] = useState(0.15);
  const [roca, setRoca]                 = useState(0.006);
  const [ieaPct, setIeaPct]             = useState(0.225);
  const [nim, setNim]                   = useState(0.0235);
  const [pmRevenue, setPmRevenue]       = useState(2500);
  const [goldCagr, setGoldCagr]         = useState(0.20);
  const [opexCagr, setOpexCagr]         = useState(0.18);
  const [taxRate, setTaxRate]           = useState(0.20);
  const [fdsoCagr, setFdsoCagr]         = useState(-0.02);
  const [pe, setPe]                     = useState(25);
  const [stockPrice, setStockPrice]     = useState(FY25.stockPrice);
  const [showSecondary, setShowSecondary] = useState(false);

  /* ── Core model computation ── */
  const model = useMemo(() => {
    // AUM
    const aumCagr = (1 + mktApprec) * (1 + netNewGrowth) - 1;
    const assets2030 = FY25.avgClientAssets * Math.pow(1 + aumCagr, 5); // $bn

    // Transactional revenue
    const transRev = assets2030 * roca * 1000; // $M

    // Net interest income
    const avgIEA = assets2030 * ieaPct * 1000; // $M
    const nii = avgIEA * nim;

    // Other revenue
    const goldOther = FY25.goldOther * Math.pow(1 + goldCagr, 5);
    const otherRev = pmRevenue + goldOther;

    // Total revenue
    const revenue = transRev + nii + pmRevenue + goldOther;

    // Revenue CAGRs
    const revCagr = Math.pow(revenue / FY25.revenue, 1 / 5) - 1;
    const transRevCagr = Math.pow(transRev / FY25.transRevenue, 1 / 5) - 1;
    const niiCagr = Math.pow(nii / FY25.nii, 1 / 5) - 1;

    // Operating expenses
    const opex = FY25.opex * Math.pow(1 + opexCagr, 5);

    // Earnings
    const pretax = revenue - opex;
    const tax = pretax > 0 ? pretax * taxRate : 0;
    const netIncome = pretax - tax;

    // Shares
    const fdso = FY25.fdso * Math.pow(1 + fdsoCagr, 5);
    const eps = netIncome / fdso;
    const epsCagr = eps > 0 && FY25.eps > 0 ? Math.pow(eps / FY25.eps, 1 / 5) - 1 : null;

    // Valuation
    const impliedPrice = eps * pe;
    const upside = (impliedPrice / stockPrice) - 1;
    const holdPeriod = 3.81; // ~Mar 2026 to Dec 2029
    const irr = impliedPrice > 0 && stockPrice > 0 ? Math.pow(impliedPrice / stockPrice, 1 / holdPeriod) - 1 : null;

    // Margins
    const pretaxMargin = revenue > 0 ? pretax / revenue : 0;
    const netMargin = revenue > 0 ? netIncome / revenue : 0;
    const opexPctRev = revenue > 0 ? opex / revenue : 0;

    return {
      aumCagr, assets2030, transRev, avgIEA, nii, goldOther, otherRev,
      pmRevenue, revenue, revCagr, transRevCagr, niiCagr, opex, pretax, tax,
      netIncome, fdso, eps, epsCagr, impliedPrice, upside, irr,
      pretaxMargin, netMargin, opexPctRev, holdPeriod,
    };
  }, [mktApprec, netNewGrowth, roca, ieaPct, nim, pmRevenue, goldCagr, opexCagr, taxRate, fdsoCagr, pe, stockPrice]);

  /* ── Sensitivity table: P/E × EPS ── */
  const sensitivity = useMemo(() => {
    const peValues = [15, 20, 25, 30, 35, 40];
    const epsOffsets = [-30, -15, 0, 15, 30]; // % change from computed EPS
    return {
      peValues,
      epsOffsets,
      grid: peValues.map(p =>
        epsOffsets.map(offset => {
          const adjEps = model.eps * (1 + offset / 100);
          return adjEps * p;
        })
      ),
    };
  }, [model.eps]);

  /* ── Chart data ── */
  const revenueChartData = useMemo(() => {
    const years = [2022, 2023, 2024, 2025];
    const data = years.map(y => ({
      year: `${y}`,
      "Transactional": HIST[y].transRev,
      "Net Interest": HIST[y].nii,
      "Prediction Mkts": HIST[y].pmRev,
      "Gold & Other": HIST[y].other,
      total: HIST[y].revenue,
    }));
    data.push({
      year: "2030E",
      "Transactional": Math.round(model.transRev),
      "Net Interest": Math.round(model.nii),
      "Prediction Mkts": pmRevenue,
      "Gold & Other": Math.round(model.goldOther),
      total: Math.round(model.revenue),
    });
    return data;
  }, [model, pmRevenue]);

  const aumChartData = useMemo(() => {
    const years = [2022, 2023, 2024, 2025];
    const data = years.map(y => ({
      year: `${y}`, aum: HIST[y].assets,
    }));
    data.push({ year: "2030E", aum: Math.round(model.assets2030 * 10) / 10 });
    return data;
  }, [model.assets2030]);

  const earningsChartData = useMemo(() => {
    const years = [2022, 2023, 2024, 2025];
    const data = years.map(y => ({
      year: `${y}`,
      revenue: HIST[y].revenue,
      netIncome: HIST[y].netIncome,
      margin: HIST[y].netIncome / HIST[y].revenue,
    }));
    data.push({
      year: "2030E",
      revenue: Math.round(model.revenue),
      netIncome: Math.round(model.netIncome),
      margin: model.netMargin,
    });
    return data;
  }, [model]);

  const epsChartData = useMemo(() => {
    const years = [2022, 2023, 2024, 2025];
    const data = years.map(y => ({
      year: `${y}`, eps: HIST[y].eps,
    }));
    data.push({ year: "2030E", eps: Math.round(model.eps * 100) / 100 });
    return data;
  }, [model.eps]);

  /* ── Revenue mix pie ── */
  const revMixData = useMemo(() => [
    { name: "Transactional", value: Math.round(model.transRev), color: C.chart1 },
    { name: "Net Interest", value: Math.round(model.nii), color: C.chart2 },
    { name: "Prediction Mkts", value: Math.round(pmRevenue), color: C.chart3 },
    { name: "Gold & Other", value: Math.round(model.goldOther), color: C.chart4 },
  ], [model, pmRevenue]);

  /* ── RENDER ── */
  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 16px; height: 16px;
          background: ${C.accent}; border-radius: 50%; cursor: pointer;
          border: 2px solid ${C.bg}; box-shadow: 0 0 6px ${C.accentDim};
        }
        input[type=range]::-moz-range-thumb {
          width: 16px; height: 16px; background: ${C.accent}; border-radius: 50%;
          cursor: pointer; border: 2px solid ${C.bg};
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        background: C.panel, borderBottom: `1px solid ${C.border}`,
        padding: "16px 32px", display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: C.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 18, color: C.bg,
        }}>H</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>
            Robinhood <span style={{ color: C.accent }}>KISS</span> Model
          </div>
          <div style={{ fontSize: 12, color: C.dim }}>
            Interactive 2030 Earnings Scenario Builder · HOOD
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: C.dim }}>HOOD Price</div>
            <div style={{ fontSize: 15, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
              {fmt(stockPrice, "$d")}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: C.dim }}>Implied 2030</div>
            <div style={{
              fontSize: 15, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
              color: model.impliedPrice > stockPrice ? C.up : C.down,
            }}>
              {fmt(model.impliedPrice, "$d")}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 69px)" }}>

        {/* ── LEFT PANEL: SLIDERS ── */}
        <div style={{
          width: 320, minWidth: 320, background: C.panel, borderRight: `1px solid ${C.border}`,
          padding: "24px 20px", overflowY: "auto", maxHeight: "calc(100vh - 69px)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.dim, textTransform: "uppercase",
            letterSpacing: 1.2, marginBottom: 16 }}>
            Key Assumptions
          </div>

          {/* Stock Price */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>Entry Price</span>
              <span style={{ color: C.accent, fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                {fmt(stockPrice, "$d")}
              </span>
            </div>
            <input
              type="number" value={stockPrice} step={0.01}
              onChange={e => setStockPrice(+e.target.value || 0)}
              style={{
                width: "100%", padding: "6px 10px", background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 6, color: C.text, fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
                outline: "none",
              }}
            />
          </div>

          <Slider label="Market Appreciation" value={mktApprec} set={setMktApprec}
            min={0} max={0.15} step={0.005} fmtType="%" note="Annual equity market return" />
          <Slider label="Net New Asset Growth" value={netNewGrowth} set={setNetNewGrowth}
            min={0.05} max={0.30} step={0.005} fmtType="%" note="Organic inflows as % of AUM" />
          <Slider label="Transactional ROCA" value={roca} set={setRoca}
            min={0.003} max={0.012} step={0.0005} fmtType="%" note="Revenue on client assets (ex-PMs)" />
          <Slider label="P/E Multiple" value={pe} set={setPe}
            min={10} max={50} step={1} fmtType="x" note="Applied to 2030 EPS" />
          <Slider label="Prediction Markets Rev" value={pmRevenue} set={setPmRevenue}
            min={0} max={5000} step={50} fmtType="$M" note="2030 prediction markets revenue" />

          {/* Secondary toggle */}
          <button
            onClick={() => setShowSecondary(!showSecondary)}
            style={{
              width: "100%", padding: "10px 0", background: "transparent",
              border: `1px solid ${C.border}`, borderRadius: 6, color: C.dim,
              fontSize: 12, cursor: "pointer", marginTop: 8, marginBottom: 8,
              letterSpacing: 0.5,
            }}
          >
            {showSecondary ? "▾ Hide" : "▸ Show"} Secondary Inputs
          </button>

          {showSecondary && (
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
              <Slider label="IEA as % of Client Assets" value={ieaPct} set={setIeaPct}
                min={0.10} max={0.35} step={0.005} fmtType="%" note="Interest-earning asset intensity" />
              <Slider label="Net Interest Margin" value={nim} set={setNim}
                min={0.01} max={0.04} step={0.0005} fmtType="%" note="Yield on interest-earning assets" />
              <Slider label="Gold & Others CAGR" value={goldCagr} set={setGoldCagr}
                min={0.05} max={0.40} step={0.01} fmtType="%" note="RH Gold subscription + other rev" />
              <Slider label="OpEx CAGR" value={opexCagr} set={setOpexCagr}
                min={0.05} max={0.30} step={0.01} fmtType="%" note="Adj. operating expense growth" />
              <Slider label="Effective Tax Rate" value={taxRate} set={setTaxRate}
                min={0.10} max={0.30} step={0.01} fmtType="%" />
              <Slider label="FDSO CAGR" value={fdsoCagr} set={setFdsoCagr}
                min={-0.05} max={0.03} step={0.005} fmtType="%" note="Negative = buybacks" />
            </div>
          )}

          {/* Excel defaults quick-set */}
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "Low", vals: { mkt: 0.04, nna: 0.10, r: 0.0075, iea: 0.20, n: 0.02, pm: 1000, gc: 0.15, oc: 0.12, tr: 0.20, fc: 0, p: 25 }},
              { label: "Med", vals: { mkt: 0.08, nna: 0.15, r: 0.006, iea: 0.225, n: 0.0235, pm: 2500, gc: 0.20, oc: 0.18, tr: 0.20, fc: -0.02, p: 25 }},
              { label: "High", vals: { mkt: 0.08, nna: 0.20, r: 0.0075, iea: 0.225, n: 0.025, pm: 3500, gc: 0.225, oc: 0.22, tr: 0.20, fc: -0.03, p: 25 }},
            ].map(s => (
              <button key={s.label} onClick={() => {
                setMktApprec(s.vals.mkt); setNetNewGrowth(s.vals.nna); setRoca(s.vals.r);
                setIeaPct(s.vals.iea); setNim(s.vals.n); setPmRevenue(s.vals.pm);
                setGoldCagr(s.vals.gc); setOpexCagr(s.vals.oc); setTaxRate(s.vals.tr);
                setFdsoCagr(s.vals.fc); setPe(s.vals.p);
              }} style={{
                flex: 1, padding: "8px 0", background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 6, color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>
                {s.label}
              </button>
            ))}
          </div>
          <div style={{ color: C.dim, fontSize: 10, marginTop: 6, textAlign: "center" }}>
            Quick-set to Excel scenario defaults
          </div>
        </div>

        {/* ── RIGHT PANEL: OUTPUT ── */}
        <div style={{ flex: 1, padding: "24px 32px", overflowY: "auto", maxHeight: "calc(100vh - 69px)" }}>

          {/* KPI ROW */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <KPICard title="Implied Price" value={fmt(model.impliedPrice, "$d")}
              subtitle={`${fmt(model.upside, "%")} ${model.upside >= 0 ? "upside" : "downside"}`}
              color={model.upside >= 0 ? C.up : C.down} />
            <KPICard title="2030E EPS" value={fmt(model.eps, "$d")}
              subtitle={model.epsCagr != null ? `${fmt(model.epsCagr, "%")} CAGR` : "—"}
              color={C.text} />
            <KPICard title="~4Yr IRR" value={model.irr != null ? fmt(model.irr, "%") : "—"}
              subtitle={`${fmt(model.impliedPrice / stockPrice, "x")} MOIC`}
              color={model.irr > 0 ? C.up : C.down} />
            <KPICard title="2030E Revenue" value={fmt(Math.round(model.revenue), "$M")}
              subtitle={`${fmt(model.revCagr, "%")} CAGR`}
              color={C.text} />
            <KPICard title="2030E Net Income" value={fmt(Math.round(model.netIncome), "$M")}
              subtitle={`${fmt(model.netMargin, "%")} margin`}
              color={model.netIncome > 0 ? C.up : C.down} />
            <KPICard title="2030E AUM" value={fmt(model.assets2030, "$B")}
              subtitle={`${fmt(model.aumCagr, "%")} CAGR`}
              color={C.text} />
          </div>

          {/* ── 2030 SNAPSHOT TABLE ── */}
          <SectionTitle>2030 Earnings Build</SectionTitle>
          <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.panel }}>
                  <th style={{ textAlign: "left", padding: "10px 16px", color: C.dim, fontWeight: 600 }}>Line Item</th>
                  <th style={{ textAlign: "right", padding: "10px 16px", color: C.dim, fontWeight: 600 }}>2025A</th>
                  <th style={{ textAlign: "right", padding: "10px 16px", color: C.dim, fontWeight: 600 }}>2030E</th>
                  <th style={{ textAlign: "right", padding: "10px 16px", color: C.dim, fontWeight: 600 }}>5Y CAGR</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Avg Client Assets ($bn)", a: FY25.avgClientAssets, e: model.assets2030, cagr: model.aumCagr, fA: "#1", fE: "#1" },
                  { label: "Transactional Revenue", a: FY25.transRevenue, e: model.transRev, cagr: model.transRevCagr },
                  { label: "Net Interest Income", a: FY25.nii, e: model.nii, cagr: model.niiCagr },
                  { label: "Prediction Markets", a: FY25.pmRevenue, e: pmRevenue, cagr: pmRevenue > 0 ? Math.pow(pmRevenue / FY25.pmRevenue, 1/5) - 1 : null },
                  { label: "Gold & Other", a: FY25.goldOther, e: model.goldOther, cagr: goldCagr },
                  { sep: true },
                  { label: "Total Revenue", a: FY25.revenue, e: model.revenue, cagr: model.revCagr, bold: true },
                  { label: "Adj. OpEx", a: FY25.opex, e: model.opex, cagr: opexCagr, neg: true },
                  { sep: true },
                  { label: "Pre-Tax Profit", a: FY25.pretax, e: model.pretax, bold: true },
                  { label: "Taxes", a: null, e: -model.tax, neg: true },
                  { label: "Net Income", a: FY25.netIncome, e: model.netIncome, bold: true,
                    color: model.netIncome > 0 ? C.up : C.down },
                  { sep: true },
                  { label: "FDSO (M shares)", a: FY25.fdso, e: model.fdso, fA: "#", fE: "#", cagr: fdsoCagr },
                  { label: "EPS", a: FY25.eps, e: model.eps, fA: "$d", fE: "$d",
                    cagr: model.epsCagr, bold: true, color: C.accent },
                ].map((row, i) => {
                  if (row.sep) return (
                    <tr key={i}><td colSpan={4} style={{ borderBottom: `1px solid ${C.border}`, height: 1 }} /></tr>
                  );
                  const fA = row.fA || "$M";
                  const fE = row.fE || "$M";
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}22` }}>
                      <td style={{ padding: "8px 16px", fontWeight: row.bold ? 600 : 400, color: row.color || C.text }}>
                        {row.label}
                      </td>
                      <td style={{ padding: "8px 16px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
                        color: C.dim, fontSize: 12 }}>
                        {row.a != null ? (fA === "$M" ? fmt(Math.round(row.a), "$") : fmt(row.a, fA)) : "—"}
                      </td>
                      <td style={{ padding: "8px 16px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: row.bold ? 600 : 400, color: row.color || C.text, fontSize: 12 }}>
                        {fE === "$M" ? fmt(Math.round(row.e), "$") : fmt(row.e, fE)}
                      </td>
                      <td style={{ padding: "8px 16px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
                        color: row.cagr != null ? (row.cagr >= 0 ? C.dim : C.warn) : C.dim, fontSize: 12 }}>
                        {row.cagr != null ? fmt(row.cagr, "%") : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── CHARTS ── */}
          <SectionTitle>Revenue Build (Historical → 2030E)</SectionTitle>
          <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 20 }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={revenueChartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="year" tick={{ fill: C.dim, fontSize: 12 }} />
                <YAxis tick={{ fill: C.dim, fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(1)}B`} />
                <Tooltip {...tooltipStyle} formatter={(v) => [`$${v.toLocaleString()}M`, undefined]} />
                <Legend wrapperStyle={{ fontSize: 11, color: C.dim }} />
                <Bar dataKey="Transactional" stackId="a" fill={C.chart1} radius={[0,0,0,0]} />
                <Bar dataKey="Net Interest" stackId="a" fill={C.chart2} />
                <Bar dataKey="Prediction Mkts" stackId="a" fill={C.chart3} />
                <Bar dataKey="Gold & Other" stackId="a" fill={C.chart4} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Mix Pie + AUM side by side */}
          <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 300px", background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.dim, marginBottom: 8 }}>2030E Revenue Mix</div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={revMixData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    outerRadius={90} innerRadius={50} paddingAngle={2}
                    label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                    labelLine={{ stroke: C.dim }}
                    style={{ fontSize: 11 }}>
                    {revMixData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(v) => [`$${v.toLocaleString()}M`, undefined]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: "1 1 300px", background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.dim, marginBottom: 8 }}>Avg Client Assets ($bn)</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={aumChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="year" tick={{ fill: C.dim, fontSize: 12 }} />
                  <YAxis tick={{ fill: C.dim, fontSize: 11 }} tickFormatter={v => `$${v}B`} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [`$${v}B`, "AUM"]} />
                  <Bar dataKey="aum" fill={C.accent} radius={[4,4,0,0]}>
                    {aumChartData.map((d, i) => (
                      <Cell key={i} fill={i === aumChartData.length - 1 ? C.accent : C.accentDim} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Net Income + EPS */}
          <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 300px", background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.dim, marginBottom: 8 }}>Revenue & Net Income ($M)</div>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={earningsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="year" tick={{ fill: C.dim, fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fill: C.dim, fontSize: 11 }}
                    tickFormatter={v => `$${(v/1000).toFixed(0)}B`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: C.dim, fontSize: 11 }}
                    tickFormatter={v => `${(v*100).toFixed(0)}%`} />
                  <Tooltip {...tooltipStyle} />
                  <Bar yAxisId="left" dataKey="revenue" fill={C.chart2} name="Revenue" radius={[4,4,0,0]} opacity={0.5} />
                  <Bar yAxisId="left" dataKey="netIncome" fill={C.chart1} name="Net Income" radius={[4,4,0,0]} />
                  <Line yAxisId="right" dataKey="margin" stroke={C.gold} strokeWidth={2}
                    name="Net Margin" dot={{ fill: C.gold, r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: "1 1 300px", background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.dim, marginBottom: 8 }}>EPS ($)</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={epsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="year" tick={{ fill: C.dim, fontSize: 12 }} />
                  <YAxis tick={{ fill: C.dim, fontSize: 11 }} tickFormatter={v => `$${v.toFixed(1)}`} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [`$${v.toFixed(2)}`, "EPS"]} />
                  <Bar dataKey="eps" fill={C.purple} radius={[4,4,0,0]}>
                    {epsChartData.map((d, i) => (
                      <Cell key={i} fill={i === epsChartData.length - 1 ? C.purple : `${C.purple}88`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── SENSITIVITY TABLE ── */}
          <SectionTitle>Sensitivity — Implied Price (P/E × EPS)</SectionTitle>
          <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
              <thead>
                <tr style={{ background: C.panel }}>
                  <th style={{ padding: "10px 12px", color: C.dim, textAlign: "center", fontSize: 11 }}>P/E ↓ · EPS Δ →</th>
                  {sensitivity.epsOffsets.map(o => (
                    <th key={o} style={{ padding: "10px 12px", color: o === 0 ? C.accent : C.dim, textAlign: "center" }}>
                      {o === 0 ? `$${model.eps.toFixed(2)}` : `${o > 0 ? "+" : ""}${o}%`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sensitivity.peValues.map((p, ri) => (
                  <tr key={p} style={{ borderBottom: `1px solid ${C.border}22` }}>
                    <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: 600,
                      color: p === pe ? C.accent : C.dim }}>{p}x</td>
                    {sensitivity.grid[ri].map((price, ci) => {
                      const isBase = p === pe && sensitivity.epsOffsets[ci] === 0;
                      const up = price / stockPrice - 1;
                      return (
                        <td key={ci} style={{
                          padding: "8px 12px", textAlign: "center",
                          background: isBase ? `${C.accent}22` : "transparent",
                          color: up >= 0 ? C.up : C.down,
                          fontWeight: isBase ? 700 : 400,
                        }}>
                          ${price.toFixed(0)}
                          <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>
                            {up >= 0 ? "+" : ""}{(up * 100).toFixed(0)}%
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── METHODOLOGY FOOTER ── */}
          <div style={{ marginTop: 40, padding: 20, background: C.panel, borderRadius: 10,
            border: `1px solid ${C.border}`, fontSize: 11, color: C.dim, lineHeight: 1.7 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: C.text }}>Methodology</div>
            <div>
              This is a simplified "KISS" (Keep It Simple, Stupid) earnings model for Robinhood (HOOD).
              It projects 2030 earnings by compounding key drivers 5 years from the 2025 base: AUM grows at
              (1 + market return) × (1 + net new asset growth) − 1; transactional revenue = AUM × ROCA;
              net interest income = AUM × IEA% × NIM; prediction markets and Gold revenue are direct inputs.
              OpEx grows at a user-specified CAGR. Implied price = 2030E EPS × P/E multiple.
              IRR is calculated from today's stock price to implied 2030 price over ~3.8 years.
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "24px 0", color: C.dim, fontSize: 11 }}>
            Built with React + Recharts · Not investment advice
          </div>
        </div>
      </div>
    </div>
  );
}
