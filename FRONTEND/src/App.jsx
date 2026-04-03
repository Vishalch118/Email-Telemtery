import SummaryCards from "./components/summaryCards";
import EmailTrendChart from "./components/EmailTrendChart";
import TopSendersChart from "./components/TopSendersChart";
import EmailsByHourChart from "./components/EmailsByHourChart";
import EmailsByWeekdayChart from "./components/EmailsByWeekdayChart";
import EmailList from "./components/emailList";

function App() {
    console.log(import.meta.env.VITE_API_URL); 
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)" }}>
      <header style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(99,102,241,0.5)" }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px" }}>Email Dashboard</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginLeft: 8 }}>Analytics</span>
            </div>
          </div>
          <div style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20, padding: "6px 14px", color: "#a5b4fc", fontSize: 13, fontWeight: 500 }}>
            Gmail Connected
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>
            Email Telemetry Dashboard
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
            All metrics pulled from Gmail API.
          </p>
        </div>

        <SummaryCards />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <EmailTrendChart />
          <TopSendersChart />
          <EmailsByHourChart />
          <EmailsByWeekdayChart />
        </div>

        <EmailList />
      </div>
    </div>
  );
}

export default App;