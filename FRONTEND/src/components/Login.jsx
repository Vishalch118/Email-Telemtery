import React, { useState } from "react";

export default function Login() {
  const [isHovered, setIsHovered] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/url`);
      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: "absolute",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        top: "-200px",
        left: "-100px",
        animation: "float 20s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        bottom: "-150px",
        right: "-100px",
        animation: "float 15s ease-in-out infinite reverse"
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 30px) scale(1.1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div style={{
        background: "rgba(255,255,255,0.03)",
        padding: "50px 60px",
        borderRadius: "24px",
        textAlign: "center",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
        position: "relative",
        zIndex: 1,
        maxWidth: "440px",
        animation: "slideUp 0.6s ease-out"
      }}>
        {/* Decorative glow */}
        <div style={{
          position: "absolute",
          top: "-100px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "200px",
          height: "200px",
          background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          animation: "pulse 3s ease-in-out infinite"
        }} />

        {/* Icon */}
        <div style={{
          width: "80px",
          height: "80px",
          margin: "0 auto 24px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          borderRadius: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "36px",
          boxShadow: "0 4px 24px rgba(99,102,241,0.4)"
        }}>
          📧
        </div>

        <h1 style={{ 
          color: "#fff", 
          marginBottom: "12px",
          fontSize: "32px",
          fontWeight: "700",
          letterSpacing: "-0.5px"
        }}>
          Email Telemetry
        </h1>

        <p style={{ 
          color: "rgba(255,255,255,0.6)", 
          marginBottom: "36px",
          fontSize: "15px",
          lineHeight: "1.6"
        }}>
          Unlock powerful insights from your inbox.<br />
          Analyze your Gmail like never before.
        </p>

        <button
          onClick={handleLogin}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            padding: "14px 32px",
            borderRadius: "12px",
            border: "none",
            fontWeight: "600",
            fontSize: "15px",
            cursor: "pointer",
            background: isHovered 
              ? "linear-gradient(135deg, #7c3aed, #6366f1)" 
              : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            boxShadow: isHovered
              ? "0 8px 24px rgba(99,102,241,0.5), 0 2px 8px rgba(0,0,0,0.2)"
              : "0 4px 16px rgba(99,102,241,0.4)",
            transform: isHovered ? "translateY(-2px)" : "translateY(0)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          <span>Continue with Google</span>
          <span>🚀</span>
        </button>

        <p style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: "12px",
          marginTop: "24px",
          lineHeight: "1.5"
        }}>
          Secure authentication via Google OAuth
        </p>
      </div>
    </div>
  );
}