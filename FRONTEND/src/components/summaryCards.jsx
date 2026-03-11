import { useEffect, useState } from "react";
import axios from "axios";

const cards = [
  {
    key: "totalEmails",
    label: "Total Emails",
    format: v => v?.toLocaleString(),
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    glow: "rgba(99,102,241,0.35)",
    accent: "#a5b4fc",
  },
  {
    key: "uniqueSenders",
    label: "Unique Senders",
    format: v => v?.toLocaleString(),
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
    glow: "rgba(6,182,212,0.35)",
    accent: "#67e8f9",
  },
  {
    key: "firstEmailDate",
    label: "First Email",
    format: v => v ? new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    glow: "rgba(16,185,129,0.35)",
    accent: "#6ee7b7",
  },
  {
    key: "latestEmailDate",
    label: "Latest Email",
    format: v => v ? new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    glow: "rgba(245,158,11,0.35)",
    accent: "#fcd34d",
  },
];

export default function SummaryCards() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3000/analytics/summary")
      .then(res => setSummary(res.data));
  }, []);

  if (!summary) return (
    <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, height: 110, animation: "pulse 1.5s infinite" }} />
      ))}
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
      {cards.map(card => (
        <div
          key={card.key}
          style={{
            flex: "1 1 180px", background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: 20,
            position: "relative",
            overflow: "hidden",
            transition: "transform 0.2s, box-shadow 0.2s",
            cursor: "default",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = `0 12px 40px ${card.glow}`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {/* Glow blob */}
          <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: card.gradient, opacity: 0.15, filter: "blur(20px)" }} />

          {/* Icon */}
          <div style={{ display: "inline-flex", padding: 8, borderRadius: 10, background: card.gradient, color: "#fff", marginBottom: 12, boxShadow: `0 4px 15px ${card.glow}` }}>
            {card.icon}
          </div>

          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
            {card.label}
          </p>
          <p style={{ color: "#fff", fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>
            {card.format(summary[card.key])}
          </p>
        </div>
      ))}
    </div>
  );
}