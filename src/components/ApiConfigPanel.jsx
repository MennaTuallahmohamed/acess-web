import { useEffect, useState } from "react";

function normalizeBaseUrl(value) {
  return value.trim().replace(/\/+$/, "");
}

export function ApiConfigPanel({ initialConfig, onSave, loading = false }) {
  const [baseUrl, setBaseUrl] = useState(initialConfig?.baseUrl || "");
  const [token, setToken] = useState(initialConfig?.token || "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setBaseUrl(initialConfig?.baseUrl || "");
    setToken(initialConfig?.token || "");
  }, [initialConfig?.baseUrl, initialConfig?.token]);

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      baseUrl: normalizeBaseUrl(baseUrl),
      token: token.trim(),
    };

    try {
      setMessage("");
      await onSave(payload);

      localStorage.setItem("apiBaseUrl", payload.baseUrl);
      localStorage.setItem("apiToken", payload.token);

      setMessage("Connection settings saved successfully.");
    } catch (error) {
      setMessage(error?.message || "Failed to save connection settings.");
    }
  };

  return (
    <section className="card connection-card">
      <div className="card-headline">
        <div>
          <h2>Backend Connection</h2>
          <p className="panel-subtitle">
            Connect the dashboard to your Nest backend API
          </p>
        </div>

        <span className="hint">
          Tip: use <code>http://localhost:3000</code>
        </span>
      </div>

      <form className="grid-form" onSubmit={submit}>
        <label>
          Base URL
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://localhost:3000"
          />
        </label>

        <label>
          JWT Token (Optional)
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste token here"
          />
        </label>

        <div className="config-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Connecting..." : "Save & Connect"}
          </button>
        </div>

        {message ? (
          <p
            className={`config-message ${
              message.toLowerCase().includes("failed") ? "error" : "success"
            }`}
          >
            {message}
          </p>
        ) : null}
      </form>
    </section>
  );
}

export default ApiConfigPanel;