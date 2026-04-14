import { useState } from "react";
import { generateReply } from "../services/api";

function getInitials(email) {
  const name = email.split("@")[0].replace(/[._]/g, " ");
  return name.split(" ").map(w => w[0]?.toUpperCase()).slice(0, 2).join("");
}

const avatarColors = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #06b6d4, #0891b2)",
  "linear-gradient(135deg, #10b981, #059669)",
  "linear-gradient(135deg, #f59e0b, #d97706)",
  "linear-gradient(135deg, #ef4444, #dc2626)",
  "linear-gradient(135deg, #ec4899, #db2777)",
];

export default function EmailList({ data: emails }) {

  const [aiReplies, setAiReplies] = useState({});
  const [loadingAI, setLoadingAI] = useState({});

  // ✅ loading guard
  if (!emails) {
    return <p style={{ color: "white", textAlign: "center" }}>Loading emails...</p>;
  }

  const handleAIReply = async (email) => {
    setLoadingAI(prev => ({
      ...prev,
      [email.gmailId]: true
    }));

    try {
      const res = await generateReply(email.subject, email.body);

      setAiReplies(prev => ({
        ...prev,
        [email.gmailId]: res.reply
      }));
    } catch (err) {
      console.error("AI reply failed:", err);
    }

    setLoadingAI(prev => ({
      ...prev,
      [email.gmailId]: false
    }));
  };

  return (
    <div className="mb-8">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 4, height: 22, borderRadius: 2, background: "linear-gradient(180deg, #6366f1, #8b5cf6)" }} />
        <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: 0 }}>Inbox</h2>
        <span style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc", fontSize: 12, fontWeight: 600, borderRadius: 20, padding: "2px 10px", marginLeft: 4 }}>
          {emails.length}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {emails.map((email, idx) => (
          <div
            key={email._id}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "16px 20px",
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              transition: "background 0.2s, border-color 0.2s, transform 0.2s",
              cursor: "default",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(99,102,241,0.08)";
              e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)";
              e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: avatarColors[idx % avatarColors.length],
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 14,
            }}>
              {getInitials(email.from || "?")}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ color: "#a5b4fc", fontSize: 12 }}>{email.from}</span>
                </div>
              </div>

              <h3 style={{ color: "#fff", fontSize: 14 }}>{email.subject}</h3>

              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                {email.body
                  ?.replace(/<[^>]+>/g, " ")
                  .replace(/\s+/g, " ")
                  .trim()
                  .slice(0, 200) || email.snippet}
              </p>

              {aiReplies[email.gmailId] && (
                <div style={{
                  marginTop: 12,
                  padding: "12px 14px",
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  borderRadius: 10,
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 13,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#a5b4fc" }}>
                    AI Generated Reply
                  </div>
                  <div>{aiReplies[email.gmailId]}</div>
                </div>
              )}
            </div>

            {/* ✅ BUTTON RESTORED EXACTLY */}
            <button
              style={{
                flexShrink: 0,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(99,102,241,0.3)",
                transition: "opacity 0.2s, transform 0.2s",
                whiteSpace: "nowrap",
              }}
              disabled={loadingAI[email.gmailId]}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "scale(0.97)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
              onClick={() => handleAIReply(email)}
            >
              ✦ Reply with AI
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}