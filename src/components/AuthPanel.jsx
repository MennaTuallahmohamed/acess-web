import { useState, useEffect } from "react";

const AUTH_PANEL_STYLES = `
  .auth-wrapper {
    position: relative;
    min-height: 100vh;
    width: 100%;
    overflow: hidden;
    padding: 32px 20px;
    box-sizing: border-box;
  }

  .auth-background {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .auth-shape {
    position: absolute;
    border-radius: 999px;
    filter: blur(70px);
    opacity: 0.22;
  }

  .shape-1 {
    width: 320px;
    height: 320px;
    background: #6d5dfc;
    top: 40px;
    left: 60px;
  }

  .shape-2 {
    width: 280px;
    height: 280px;
    background: #4f46e5;
    right: 90px;
    top: 120px;
  }

  .shape-3 {
    width: 260px;
    height: 260px;
    background: #7c3aed;
    left: 50%;
    bottom: 40px;
    transform: translateX(-50%);
  }

  .auth-container {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 980px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-radius: 28px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #dbe3f0;
    box-shadow: 0 30px 70px rgba(15, 23, 42, 0.12);
    backdrop-filter: blur(14px);
  }

  .auth-left {
    padding: 38px 36px;
    background: linear-gradient(135deg, #6d5dfc 0%, #5b52f3 45%, #4f46e5 100%);
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 620px;
  }

  .auth-brand-wrap {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 26px;
  }

  .auth-brand-icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.24);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
  }

  .auth-brand-text {
    margin: 0;
    font-size: 19px;
    font-weight: 800;
    letter-spacing: -0.3px;
  }

  .auth-tagline {
    margin: 0;
    font-size: 30px;
    line-height: 1.08;
    font-weight: 800;
    letter-spacing: -0.9px;
    max-width: 320px;
  }

  .auth-desc {
    margin: 18px 0 0;
    max-width: 360px;
    color: rgba(255,255,255,0.85);
    font-size: 14px;
    line-height: 1.55;
    font-weight: 500;
  }

  .auth-stats {
    display: flex;
    gap: 28px;
    margin-top: auto;
    padding-top: 34px;
  }

  .auth-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .auth-stat b {
    font-size: 18px;
    font-weight: 800;
  }

  .auth-stat span {
    font-size: 12px;
    color: rgba(255,255,255,0.75);
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .auth-right {
    background: #fff;
    padding: 38px 34px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .auth-form-card {
    width: 100%;
    max-width: 360px;
  }

  .auth-header {
    text-align: center;
    margin-bottom: 22px;
  }

  .auth-header h2 {
    margin: 0;
    color: #182033;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }

  .auth-header p {
    margin: 8px 0 0;
    color: #7c8aa5;
    font-size: 13px;
    font-weight: 500;
  }

  .auth-tabs {
    background: #f3f5fb;
    border-radius: 12px;
    padding: 4px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    margin-bottom: 22px;
  }

  .auth-tab {
    border: none;
    background: transparent;
    height: 38px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    color: #6b7280;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .auth-tab.active {
    background: #fff;
    color: #1f2937;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .auth-error {
    padding: 12px 14px;
    border-radius: 12px;
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
    font-size: 13px;
    font-weight: 700;
  }

  .auth-input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .auth-input-group label {
    font-size: 13px;
    font-weight: 700;
    color: #334155;
  }

  .auth-input-icon {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 48px;
    border-radius: 12px;
    background: #eef4ff;
    border: 1px solid #d7e3fb;
    padding: 0 14px;
    transition: 0.2s ease;
  }

  .auth-input-icon:focus-within {
    background: #ffffff;
    border-color: #7c83ff;
    box-shadow: 0 0 0 4px rgba(109, 93, 252, 0.10);
  }

  .auth-input-icon .icon {
    font-size: 14px;
    line-height: 1;
    opacity: 0.9;
    flex-shrink: 0;
  }

  .auth-input-icon input,
  .auth-input-icon select {
    flex: 1;
    width: 100%;
    min-width: 0;
    height: 46px;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
  }

  .auth-input-icon input::placeholder {
    color: #8ea0bc;
    font-weight: 500;
  }

  .auth-input-icon select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    cursor: pointer;
    padding-right: 26px;
  }

  .auth-select-wrap {
    position: relative;
  }

  .auth-select-wrap::after {
    content: "▾";
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: #64748b;
    pointer-events: none;
    font-weight: 800;
  }

  .auth-submit {
    margin-top: 4px;
    height: 48px;
    border: none;
    border-radius: 14px;
    background: linear-gradient(135deg, #6d5dfc 0%, #4f46e5 100%);
    color: #fff;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(79, 70, 229, 0.24);
    transition: 0.2s ease;
  }

  .auth-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(79, 70, 229, 0.30);
  }

  .auth-submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .auth-loader {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    display: inline-block;
    animation: auth-spin 0.8s linear infinite;
  }

  @keyframes auth-spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 900px) {
    .auth-container {
      grid-template-columns: 1fr;
      max-width: 620px;
    }

    .auth-left {
      min-height: auto;
      padding: 28px 24px;
    }

    .auth-right {
      padding: 28px 22px;
    }

    .auth-tagline {
      font-size: 26px;
      max-width: 100%;
    }

    .auth-stats {
      margin-top: 28px;
      padding-top: 0;
    }
  }

  @media (max-width: 520px) {
    .auth-wrapper {
      padding: 14px;
    }

    .auth-left,
    .auth-right {
      padding: 20px 16px;
    }

    .auth-form-card {
      max-width: 100%;
    }

    .auth-tagline {
      font-size: 24px;
    }
  }
`;

const initialForm = {
  email: "",
  password: "",
  role: "viewer",
};

export function AuthPanel({ onLogin, onRegister, loading }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    const styleId = "auth-panel-inline-styles";
    let styleTag = document.getElementById(styleId);

    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      styleTag.innerHTML = AUTH_PANEL_STYLES;
      document.head.appendChild(styleTag);
    }
  }, []);

  useEffect(() => {
    setError("");
    setForm((prev) => ({
      ...prev,
      role: prev.role || "viewer",
    }));
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "register") {
        await onRegister({
          email: form.email,
          password: form.password,
          role: form.role,
        });
      } else {
        await onLogin({
          email: form.email,
          password: form.password,
        });
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-background">
        <div className="auth-shape shape-1"></div>
        <div className="auth-shape shape-2"></div>
        <div className="auth-shape shape-3"></div>
      </div>

      <div className="auth-container">
        <div className="auth-left">
          <div>
            <div className="auth-brand-wrap">
              <div className="auth-brand-icon">⚡</div>
              <h1 className="auth-brand-text">InspectPro</h1>
            </div>

            <h2 className="auth-tagline">
              Next-Generation <br /> Maintenance Dashboard
            </h2>

            <p className="auth-desc">
              Seamlessly monitor, filter, and analyze all your data in real-time.
            </p>
          </div>

          <div className="auth-stats">
            <div className="auth-stat">
              <b>10K+</b>
              <span>DEVICES</span>
            </div>
            <div className="auth-stat">
              <b>99.9%</b>
              <span>UPTIME</span>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-card">
            <div className="auth-header">
              <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
              <p>
                {mode === "login"
                  ? "Enter your credentials to access the dashboard"
                  : "Sign up to begin exploring"}
              </p>
            </div>

            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${mode === "login" ? "active" : ""}`}
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Sign In
              </button>

              <button
                type="button"
                className={`auth-tab ${mode === "register" ? "active" : ""}`}
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
              >
                Sign Up
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {error && <div className="auth-error">{error}</div>}

              <div className="auth-input-group">
                <label>Email Address</label>
                <div className="auth-input-icon">
                  <span className="icon">✉️</span>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Password</label>
                <div className="auth-input-icon">
                  <span className="icon">🔒</span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>
              </div>

              {mode === "register" && (
                <div className="auth-input-group">
                  <label>Choose Role</label>
                  <div className="auth-input-icon auth-select-wrap">
                    <span className="icon">👤</span>
                    <select
                      value={form.role}
                      onChange={(e) =>
                        setForm({ ...form, role: e.target.value })
                      }
                      required
                    >
                      <option value="viewer">Viewer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              )}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <span className="auth-loader"></span>
                ) : mode === "login" ? (
                  "Sign In to Dashboard"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}