import { useEffect, useState } from "react";

import SummaryCards from "./components/summaryCards";
import EmailTrendChart from "./components/EmailTrendChart";
import TopSendersChart from "./components/TopSendersChart";
import EmailsByHourChart from "./components/EmailsByHourChart";
import EmailsByWeekdayChart from "./components/EmailsByWeekdayChart";
import EmailList from "./components/emailList";
import Login from "./components/Login";

import {
  getSummary,
  getEmailsPerDay,
  getTopSenders,
  getEmailsByHour,
  getEmailsByWeekday,
  getEmails
} from "./services/api";

function App() {
  const [data, setData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setData(null);
  };

  // ✅ Handle OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const email = params.get("email");

    if (accessToken && email) {
      localStorage.setItem("token", accessToken);
      localStorage.setItem("userEmail", email);

      setToken(accessToken);

      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  // ✅ Validate login BEFORE anything
  const userEmail = localStorage.getItem("userEmail");

  // ✅ Fetch data only when token is valid
  useEffect(() => {
    if (!token) return;

    const fetchAll = async () => {
      try {
        const [
          summary,
          perDay,
          topSenders,
          byHour,
          byWeekday,
          emails
        ] = await Promise.all([
          getSummary(),
          getEmailsPerDay(),
          getTopSenders(),
          getEmailsByHour(),
          getEmailsByWeekday(),
          getEmails()
        ]);

        setData({
          summary: summary.data,
          perDay: perDay.data,
          topSenders: topSenders.data,
          byHour: byHour.data,
          byWeekday: byWeekday.data,
          emails: emails.data
        });

      } catch (err) {
        console.error("Error loading dashboard:", err);

        // 🔥 AUTO LOGOUT IF TOKEN EXPIRED / INVALID
        if (err.response?.status === 401 || err.response?.status === 500) {
          localStorage.clear();
          window.location.reload();
        }
      }
    };

    fetchAll();
  }, [token]);

  if (!token || !userEmail) {
    localStorage.clear(); // clean broken state
    return <Login />;
  }

  // ✅ Loading state
  if (!data) {
    return (
      <p style={{ color: "white", textAlign: "center", marginTop: 50 }}>
        Loading dashboard...
      </p>
    );
  }

  // ✅ Dashboard UI
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)" }}>
      <header style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(99,102,241,0.5)" }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>Email Dashboard</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginLeft: 8 }}>Analytics</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 20,
              padding: "6px 14px",
              color: "#a5b4fc",
              fontSize: 13
            }}>
              Gmail Connected
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 20,
                padding: "6px 14px",
                color: "#fca5a5",
                fontSize: 13,
                cursor: "pointer"
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>
            Email Telemetry Dashboard
          </h1>
        </div>

        <SummaryCards data={data.summary} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <EmailTrendChart data={data.perDay} />
          <TopSendersChart data={data.topSenders} />
          <EmailsByHourChart data={data.byHour} />
          <EmailsByWeekdayChart data={data.byWeekday} />
        </div>

        <EmailList data={data.emails} />
      </div>
    </div>
  );
}

export default App;