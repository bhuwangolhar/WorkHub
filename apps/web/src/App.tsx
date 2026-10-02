import { useEffect, useState } from "react";

type ApiStatus = "checking" | "online" | "offline";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export default function App() {
  const [status, setStatus] = useState<ApiStatus>("checking");

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => setStatus(res.ok ? "online" : "offline"))
      .catch(() => setStatus("offline"));
  }, []);

  return (
    <main className="container">
      <h1>WorkHub</h1>
      <p>Multi-tenant office management.</p>
      <p>
        API status: <strong className={`status status-${status}`}>{status}</strong>
      </p>
    </main>
  );
}