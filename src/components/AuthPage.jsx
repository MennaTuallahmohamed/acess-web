import { useState } from "react";

const styles = `
  .auth-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fb;
    font-family: 'Inter', system-ui, sans-serif;
    position: relative;
    overflow: hidden;
  }
  .auth-background {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;
  }
  .auth-shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.6;
  }
  .shape-1 {
    width: 500px; height: 500px;
    background: rgba(108, 99, 255, 0.2);
    top: -100px; left: -100px;
    animation: float 10s ease-in-out infinite;
  }
  .shape-2 {
    width: 400px; height: 400px;
    background: rgba(0, 212, 255, 0.2);
    bottom: -50px; right: -50px;
    animation: float 12s ease-in-out infinite reverse;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(20px) scale(1.05); }
  }
  .auth-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 960px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 24px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 1);
    overflow: hidden;
    margin: 24px;
  }
  .auth-left {
    background: linear-gradient(135deg, #6c63ff, #5a52d5);
    padding: 48px;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .auth-left::after {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.5;
    pointer-events: none;
  }
  .auth-brand-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 40px;
    position: relative;
    z-index: 1;
  }
  .auth-brand-icon {
    width: 48px; height: 48px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  .auth-brand-text {
    font-size: 28px;
    font-weight: 800;
    margin: 0;
    letter-spacing: -1px;
  }
  .auth-tagline {
    font-size: 32px;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
  }
  .auth-desc {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    margin-bottom: 48px;
    position: relative;
    z-index: 1;
  }
  .auth-stats {
    display: flex;
    gap: 32px;
    position: relative;
    z-index: 1;
    margin-top: auto;
  }
  .auth-stat b {
    display: block;
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 4px;
  }
  .auth-stat span {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .auth-right {
    padding: 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .auth-form-card {
    max-width: 360px;
    margin: 0 auto;
    width: 100%;
  }
  .auth-header {
    margin-bottom: 32px;
    text-align: center;
  }
  .auth-header h2 {
    font-size: 28px;
    font-weight: 800;
    color: #1a1f2e;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
  }
  .auth-header p {
    font-size: 14px;
    color: #6f7794;
  }
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .auth-input-group label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #1a1f2e;
    margin-bottom: 8px;
  }
  .auth-input-icon {
    position: relative;
    display: flex;
    align-items: center;
  }
  .auth-input-icon .icon {
    position: absolute;
    left: 14px;
    color: #a3aec7;
    font-size: 16px;
  }
  .auth-input-group input {
    width: 100%;
    height: 48px;
    padding: 0 16px 0 42px;
    border: 1px solid #e8ebf3;
    border-radius: 12px;
    background: #f8f9fb;
    font-size: 15px;
    color: #1a1f2e;
    transition: all 0.2s;
    font-family: inherit;
  }
  .auth-input-group input:focus {
    outline: none;
    border-color: #6c63ff;
    background: white;
    box-shadow: 0 0 0 4px rgba(108, 99, 255, 0.1);
  }
  .auth-input-group input::placeholder { color: #a3aec7; }
  .auth-error {
    background: rgba(255, 107, 107, 0.1);
    color: #ff6b6b;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid rgba(255, 107, 107, 0.2);
  }
  .auth-submit {
    height: 48px;
    background: linear-gradient(135deg, #6c63ff, #5a52d5);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
    width: 100%;
  }
  .auth-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(108, 99, 255, 0.4);
  }
  .auth-submit:disabled { opacity: 0.7; cursor: not-allowed; }
  .auth-loader {
    width: 20px; height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 768px) {
    .auth-container { grid-template-columns: 1fr; max-width: 480px; }
    .auth-left { padding: 32px; }
    .auth-right { padding: 32px; }
  }
`;

export function AuthPage({ onLogin, loading }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await onLogin(form);
    } catch (err) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-wrapper">
        <div className="auth-background">
          <div className="auth-shape shape-1"></div>
          <div className="auth-shape shape-2"></div>
        </div>

        <div className="auth-container">
          <div className="auth-left">
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
            <div className="auth-stats">
              <div className="auth-stat">
                <b>10K+</b>
                <span>Devices</span>
              </div>
              <div className="auth-stat">
                <b>99.9%</b>
                <span>Uptime</span>
              </div>
            </div>
          </div>

          <div className="auth-right">
            <div className="auth-form-card">
              <div className="auth-header">
                <h2>Welcome Back</h2>
                <p>Enter your credentials to access the dashboard</p>
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
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? (
                    <span className="auth-loader"></span>
                  ) : (
                    "Sign In to Dashboard"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export { AuthPage as AuthPanel };

export default AuthPage;
