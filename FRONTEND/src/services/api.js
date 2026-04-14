import axios from "axios";

// ✅ Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ✅ Attach token + userEmail to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("userEmail");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (userEmail) {
    config.headers["x-user-email"] = userEmail;
  }

  return config;
});

// ================= API CALLS =================

export const getSummary = () => API.get("/analytics/summary");
export const getEmailsPerDay = () => API.get("/analytics/emails-per-day");
export const getTopSenders = () => API.get("/analytics/top-senders");
export const getEmailsByHour = () => API.get("/analytics/emails-by-hour");
export const getEmailsByWeekday = () => API.get("/analytics/emails-by-weekday");
export const getEmails = () => API.get("/emails");

// ================= AI REPLY =================

export const generateReply = async (subject, body) => {
  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("userEmail");

  const res = await fetch(`${import.meta.env.VITE_API_URL}/ai/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "x-user-email": userEmail
    },
    body: JSON.stringify({ subject, body })
  });

  return res.json();
};

export default API;