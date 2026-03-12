import { useEffect, useState } from "react";
import { getEmails } from "../services/api";
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

export default function EmailList() {
  const [emails, setEmails] = useState([]);
  const [aiReplies, setAiReplies] = useState({});
  const [loadingAI, setLoadingAI] = useState({});
  useEffect(() => {
    getEmails().then(res => setEmails(res.data));
  }, []);

  const handleAIReply = async (email) => {

    setLoadingAI(prev => ({
      ...prev,
      [email.gmailId]: true
    }));

    const res = await generateReply(email.subject, email.body);

    setAiReplies(prev => ({
      ...prev,
      [email.gmailId]: res.reply
    }));

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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, flexWrap: "wrap", gap: 4 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>From </span>
                    <span style={{ color: "#a5b4fc" }}>{email.from}</span>
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>To </span>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>{email.to}</span>
                  </span>

                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>Date </span>
                    {new Date(email.date).toLocaleString()}
                  </span>
                </div>
              </div>

              <h3 style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: "0 0 6px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {email.subject}
              </h3>

              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {email.body
                  ?.replace(/<[^>]+>/g, " ")
                  .replace(/\s+/g, " ")
                  .trim()
                  .slice(0, 200) || email.snippet}
              </p>


              {aiReplies[email.gmailId] && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "12px 14px",
                    background: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    borderRadius: 10,
                    color: "rgba(255,255,255,0.85)",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      color: "#a5b4fc",
                      marginBottom: 6,
                    }}
                  >
                    AI Generated Reply
                  </div>

                  <div>{aiReplies[email.gmailId]}</div>
                </div>
              )}
            </div>

            {/* Action */}
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