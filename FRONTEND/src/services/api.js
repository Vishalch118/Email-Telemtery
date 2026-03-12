import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getSummary = () => API.get("/analytics/summary");
export const getEmailsPerDay = () => API.get("/analytics/emails-per-day");
export const getTopSenders = () => API.get("/analytics/top-senders");
export const getEmailsByHour = () => API.get("/analytics/emails-by-hour");
export const getEmailsByWeekday = () => API.get("/analytics/emails-by-weekday");
export const getEmails = () => API.get("/emails");

export const generateReply = async (subject, body) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/ai/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ subject, body })
  });

  return res.json();
};

export default API;