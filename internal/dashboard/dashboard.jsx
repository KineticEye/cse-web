import { useState } from "react";
import {
  WEEKS, WEEK_KEYS, CLIENT_LOGINS, TOTAL_CLIENTS,
  LOGIN_DATA, SITE_DATA, LAST_UPDATED,
} from "./data.js";

const COMPANIES = Object.keys(SITE_DATA).sort();
const LATEST_WEEK = WEEKS[WEEKS.length - 1];

// Clients that didn't log in during the latest week, with their last login info
const NOT_LOGGED_IN = Object.entries(CLIENT_LOGINS)
  .filter(([, last]) => last !== LATEST_WEEK)
  .map(([name, last]) => ({ name, lastLogin: last || "NEVER" }))
  .sort((a, b) => a.lastLogin === "NEVER" ? -1 : b.lastLogin === "NEVER" ? 1 : 0);

// ---- Data helpers ----

export function companyRollup(name) {
  const sites = SITE_DATA[name] || {};
  const siteValues = Object.values(sites);
  return WEEK_KEYS.reduce((acc, wk) => {
    const active = siteValues.filter(s => s[wk]).map(s => s[wk]);
    if (active.length === 0) { acc[wk] = null; return acc; }
    const n = active.length;
    const avgDaily = Math.round(active.reduce((s, d) => s + d.avg_daily, 0) / n * 10) / 10;
    const ratedSites = active.filter(d => d.fp_rate !== null);
    const fpRate = ratedSites.length > 0
      ? Math.round(ratedSites.reduce((s, d) => s + d.fp_rate, 0) / ratedSites.length * 1000) / 1000
      : null;
    const totalRated = active.reduce((s, d) => s + d.rated, 0);
    const totalGood = active.reduce((s, d) => s + d.good, 0);
    const totalTotal = active.reduce((s, d) => s + d.total, 0);
    acc[wk] = { total: totalTotal, avg_daily: avgDaily, rated: totalRated, good: totalGood, fp_rate: fpRate };
    return acc;
  }, {});
}

export function latestNonNull(weekMap) {
  return [...WEEK_KEYS].reverse().map(k => weekMap[k]).find(d => d !== null) ?? null;
}

// ---- Shared styles ----

const tdS = { padding: "8px 10px", verticalAlign: "middle", borderBottom: "1px solid #0b0f18" };
const thS = {
  padding: "7px 10px", color: "#4a6080", fontSize: 10, fontWeight: 700,
  letterSpacing: "0.08em", textTransform: "uppercase",
  borderBottom: "1px solid #131c2c", whiteSpace: "nowrap", background: "#07090f",
};
const sectionHeaderS = {
  padding: "9px 14px", fontSize: 10, fontWeight: 700,
  letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: "1px solid #131c2c",
};

// ---- Primitive components ----

function MiniBar({ value, max, color, threshold }) {
  const pct = Math.min((value / max) * 100, 100);
  const thPct = Math.min((threshold / max) * 100, 100);
  return (
    <div style={{ position: "relative", height: 5, background: "#0d1118", borderRadius: 3, width: "100%", minWidth: 40 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3 }} />
      <div style={{ position: "absolute", top: -2, left: `${thPct}%`, width: 1, height: 9, background: "#374151" }} />
    </div>
  );
}

function AvgCell({ d, muted }) {
  if (!d) return <td style={{ ...tdS, color: "#141a24", fontSize: 11 }}>—</td>;
  const v = d.avg_daily;
  const color = muted ? (v > 10 ? "#7a2020" : "#2a4a38") : (v > 10 ? "#ef4444" : "#4ade80");
  return (
    <td style={tdS}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ color, fontSize: 11, fontWeight: muted ? 400 : 600, minWidth: 28, fontVariantNumeric: "tabular-nums" }}>{v}</span>
        {!muted && <div style={{ flex: 1 }}><MiniBar value={v} max={80} color={color} threshold={10} /></div>}
      </div>
    </td>
  );
}

function FpCell({ d, prev, muted }) {
  if (!d) return <td style={{ ...tdS, color: "#141a24", fontSize: 11 }}>—</td>;
  if (d.fp_rate === null) return (
    <td style={{ ...tdS, color: "#253040", fontSize: 10 }}>
      <span title="No findings were rated this week">n/r</span>
    </td>
  );
  const pct = Math.round(d.fp_rate * 100);
  const color = muted
    ? (pct > 50 ? "#7a2020" : pct > 30 ? "#5a4010" : "#2a4a38")
    : (pct > 50 ? "#ef4444" : pct > 30 ? "#f59e0b" : "#4ade80");
  const ratedPct = d.total > 0 ? Math.round(d.rated / d.total * 100) : 0;

  let arrow = null;
  if (prev && prev.fp_rate !== null) {
    const prevPct = Math.round(prev.fp_rate * 100);
    if (pct < prevPct) arrow = { symbol: "▼", color: muted ? "#2a4a38" : "#4ade80" };
    else if (pct > prevPct) arrow = { symbol: "▲", color: muted ? "#7a2020" : "#ef4444" };
  }

  return (
    <td style={tdS}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {arrow && <span style={{ color: arrow.color, fontSize: 7, lineHeight: 1 }}>{arrow.symbol}</span>}
            <span style={{ color, fontSize: 11, fontWeight: muted ? 400 : 600, minWidth: 32, fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
            {!muted && <div style={{ flex: 1, minWidth: 40 }}><MiniBar value={pct} max={100} color={color} threshold={30} /></div>}
          </div>
          {!muted && (
            <div style={{ fontSize: 9, color: "#2a3a50", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
              {d.rated} rated / {d.total} total ({ratedPct}%)
            </div>
          )}
        </div>
      </div>
    </td>
  );
}

function NameCell({ name, neverLoggedIn, multiSite, siteCount, open }) {
  const d = companyRollup(name);
  const latest = latestNonNull(d);
  const fpOk   = !latest || latest.fp_rate === null || latest.fp_rate <= 0.3;
  const dailyOk = !latest || latest.avg_daily <= 10;
  const lastLogin = CLIENT_LOGINS[name];
  const lastLoginLabel = lastLogin || "NEVER";
  const bothBad = !fpOk && !dailyOk;
  const bothGood = fpOk && dailyOk;
  const dotColor = neverLoggedIn ? "#f97316" : bothBad ? "#ef4444" : bothGood ? "#4ade80" : "#f59e0b";
  const dotGlow  = neverLoggedIn ? "#f9731650" : bothBad ? "#ef444450" : bothGood ? "#4ade8050" : "#f59e0b50";
  return (
    <td style={{ ...tdS, whiteSpace: "nowrap", position: "sticky", left: 0, background: "#07090f", zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: dotColor, boxShadow: `0 0 5px ${dotGlow}`, flexShrink: 0 }} />
        <span style={{ color: neverLoggedIn ? "#f97316" : "#a8bcd4", fontSize: 12, fontWeight: 500 }}>{name}</span>
        {neverLoggedIn && <span style={{ fontSize: 9, color: "#f97316", background: "#1c0800", padding: "1px 5px", borderRadius: 3, border: "1px solid #f9731625" }}>last: {lastLoginLabel}</span>}
        {multiSite && <span style={{ marginLeft: 3, color: "#2a3a52", fontSize: 10 }}>{open ? "▾" : "▸"} {siteCount}</span>}
      </div>
    </td>
  );
}

function SiteNameCell({ site }) {
  return (
    <td style={{ ...tdS, paddingLeft: 26, whiteSpace: "nowrap", position: "sticky", left: 0, background: "#040710", zIndex: 1 }}>
      <span style={{ color: "#253545", fontSize: 10, marginRight: 4 }}>↳</span>
      <span style={{ color: "#3a5472", fontSize: 11 }}>{site}</span>
    </td>
  );
}

function CompanyRows({ name, section }) {
  const [open, setOpen] = useState(false);
  const compData = companyRollup(name);
  const sites = SITE_DATA[name] || {};
  const siteNames = Object.keys(sites).sort();
  const multiSite = siteNames.length > 1;
  const neverLoggedIn = CLIENT_LOGINS[name] !== LATEST_WEEK;
  const rowBg = neverLoggedIn ? "#120808" : "transparent";

  return (
    <>
      <tr
        style={{ background: rowBg, cursor: multiSite ? "pointer" : "default" }}
        onMouseEnter={e => e.currentTarget.style.background = neverLoggedIn ? "#1c0b0b" : "#090d16"}
        onMouseLeave={e => e.currentTarget.style.background = rowBg}
        onClick={() => multiSite && setOpen(o => !o)}
      >
        <NameCell name={name} neverLoggedIn={neverLoggedIn} multiSite={multiSite} siteCount={siteNames.length} open={open} />
        {section === "vol"
          ? WEEK_KEYS.map(k => <AvgCell key={k} d={compData[k]} />)
          : WEEK_KEYS.map((k, i) => <FpCell key={k} d={compData[k]} prev={i > 0 ? compData[WEEK_KEYS[i - 1]] : null} />)}
      </tr>
      {open && siteNames.map(site => {
        const sd = sites[site];
        return (
          <tr key={site} style={{ background: "#040710" }}>
            <SiteNameCell site={site} />
            {section === "vol"
              ? WEEK_KEYS.map(k => <AvgCell key={k} d={sd[k] ?? null} muted />)
              : WEEK_KEYS.map((k, i) => <FpCell key={k} d={sd[k] ?? null} prev={i > 0 ? (sd[WEEK_KEYS[i - 1]] ?? null) : null} muted />)}
          </tr>
        );
      })}
    </>
  );
}

function Section({ title, subtitle, color, section }) {
  return (
    <div style={{ border: "1px solid #111c2c", borderRadius: 6, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ ...sectionHeaderS, background: "#07090f", borderLeft: `3px solid ${color}`, display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ color }}>{title}</span>
        <span style={{ color: "#4a6080", fontSize: 9, fontWeight: 400, letterSpacing: "0.05em", textTransform: "none" }}>{subtitle}</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ ...thS, width: 185, textAlign: "left", position: "sticky", left: 0 }}>Client</th>
              {WEEKS.map(w => (
                <th key={w} style={{ ...thS, textAlign: "left", minWidth: section === "fp" ? 160 : 110 }}>
                  {section === "vol" ? "avg/day" : "FP rate"}
                  <br /><span style={{ color: "#3d5570", fontWeight: 400 }}>{w}</span>
                </th>
              ))}
            </tr>
            <tr style={{ background: "#050810" }}>
              <td style={{ ...tdS, paddingTop: 2, paddingBottom: 2, position: "sticky", left: 0, background: "#050810" }}>
                <span style={{ fontSize: 9, color: "#3d5570" }}>threshold →</span>
              </td>
              {WEEKS.map(w => (
                <td key={w} style={{ ...tdS, paddingTop: 2, paddingBottom: 2 }}>
                  <span style={{ fontSize: 9, color: "#3d5570" }}>{section === "vol" ? "max 10/day" : "max 30%"}</span>
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPANIES.map(name => <CompanyRows key={name} name={name} section={section} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoginChart() {
  const W = 460, H = 90, pad = { l: 28, r: 12, t: 14, b: 22 };
  const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
  const pts = LOGIN_DATA.map((d, i) => ({
    x: pad.l + (i / (LOGIN_DATA.length - 1)) * iW,
    y: pad.t + iH - (d.pct / 100) * iH, ...d,
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${pts[pts.length - 1].x} ${pad.t + iH} L ${pts[0].x} ${pad.t + iH} Z`;
  return (
    <svg width={W} height={H} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 50, 100].map(v => {
        const y = pad.t + iH - (v / 100) * iH;
        return <line key={v} x1={pad.l} x2={pad.l + iW} y1={y} y2={y} stroke="#0d1320" strokeWidth={1} />;
      })}
      <path d={area} fill="url(#lg)" />
      <path d={path} fill="none" stroke="#4ade80" strokeWidth={2} strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} fill="#060a10" stroke="#4ade80" strokeWidth={1.5} />
          {(i === 0 || i === pts.length - 1 || p.pct !== pts[i - 1]?.pct) &&
            <text x={p.x} y={p.y - 7} fill="#4ade80" fontSize={9} textAnchor="middle" fontWeight="700">{p.pct}%</text>}
          {(i % 2 === 0 || i === pts.length - 1) &&
            <text x={p.x} y={pad.t + iH + 14} fill="#233040" fontSize={8.5} textAnchor="middle">{p.week}</text>}
        </g>
      ))}
    </svg>
  );
}

function KPICard({ label, value, sub, color }) {
  return (
    <div style={{ background: "#090d16", border: "1px solid #111c2c", borderRadius: 6, padding: "14px 18px", flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 9, color: "#4a6080", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || "#c8d0e0", lineHeight: 1, marginBottom: 3, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#6a85a0" }}>{sub}</div>
    </div>
  );
}

// ---- Root component ----

export default function Dashboard() {
  let fpIssues = 0, dailyIssues = 0;
  COMPANIES.forEach(name => {
    const d = companyRollup(name);
    const latest = latestNonNull(d);
    if (!latest) return;
    if (latest.fp_rate !== null && latest.fp_rate > 0.3) fpIssues++;
    if (latest.avg_daily > 10) dailyIssues++;
  });

  const latestLogin = LOGIN_DATA[LOGIN_DATA.length - 1];

  return (
    <div style={{ background: "#050810", minHeight: "100vh", color: "#c8d0e0", fontFamily: "'IBM Plex Mono','Courier New',monospace", padding: "22px 26px" }}>
      <style>{`*, *::before, *::after { box-sizing: border-box; } ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: #0d1117; } ::-webkit-scrollbar-thumb { background: #1e2535; border-radius: 2px; }`}</style>

      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 9, color: "#4a6080", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 3 }}>CompScience · Customer Health</div>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: "#d4e0f4", letterSpacing: "-0.01em" }}>Feb–Mar 2026 — Operations Dashboard</h1>
        </div>
        <div style={{ fontSize: 10, color: "#4a6080", textAlign: "right" }}>
          <div>{TOTAL_CLIENTS} active clients · through {WEEKS[WEEKS.length - 1]}</div>
          {LAST_UPDATED && <div style={{ marginTop: 2, fontSize: 9, color: "#344058" }}>updated {new Date(LAST_UPDATED).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</div>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label={`Login Rate (${latestLogin.week})`} value={`${latestLogin.pct}%`} sub={`${latestLogin.n} of ${latestLogin.active} active clients`} color="#4ade80" />
        <KPICard label="Not Logged In (latest)" value={NOT_LOGGED_IN.length} sub={NOT_LOGGED_IN.map(c => `${c.name} (${c.lastLogin})`).join(", ")} color={NOT_LOGGED_IN.length > 0 ? "#f97316" : "#4ade80"} />
        <KPICard label="Alert Vol Issues" value={dailyIssues} sub="clients >10/day (latest)" color={dailyIssues > 0 ? "#ef4444" : "#4ade80"} />
        <KPICard label="FP Rate Issues" value={fpIssues} sub="clients >30% FP (latest rated)" color={fpIssues > 0 ? "#ef4444" : "#4ade80"} />
      </div>

      <div style={{ background: "#090d16", border: "1px solid #111c2c", borderRadius: 6, padding: "14px 18px", marginBottom: 20, display: "inline-flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 9, color: "#4a6080", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>% Active Clients Logging In Weekly</div>
        <LoginChart />
        {NOT_LOGGED_IN.length > 0 && (
          <div style={{ fontSize: 10, color: "#f97316" }}>
            ⚠ Not logged in this week: {NOT_LOGGED_IN.map(c => `${c.name} (last: ${c.lastLogin})`).join(" · ")}
          </div>
        )}
      </div>

      <Section title="Alert Volume" subtitle="avg findings per day per site · threshold: 10/day" color="#60a5fa" section="vol" />
      <Section title="False Positive Rate" subtitle="of rated findings only · threshold: 30% · rated count shown below each value" color="#f472b6" section="fp" />

      <div style={{ background: "#090d16", border: "1px solid #1c2030", borderRadius: 6, padding: "12px 16px", marginBottom: 12, fontSize: 11, color: "#4a6080", lineHeight: 1.6 }}>
        <span style={{ color: "#f472b6", fontWeight: 700 }}>⚠ FP rate caveat: </span>
        Rates are calculated only on <em>rated</em> findings (thumbs up/down or marked false positive). Most findings are never rated — e.g. Badia Spice had <span style={{ color: "#c8d0e0" }}>25 rated out of 305 total (8%)</span>, all 22 bad ones flagged by the same reviewer in a single session. A high FP rate on a small sample may reflect one user's session, not the full picture. Look at the "X rated / Y total" count to gauge confidence.
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 9, color: "#4a6080" }}>
        <span>avg/day = weekly total ÷ 7 · site = batch_name</span>
        <span>FP = false_positive=TRUE or feedback=down · n/r = no ratings that week</span>
        <span>▸ click multi-site clients to expand</span>
      </div>
    </div>
  );
}
