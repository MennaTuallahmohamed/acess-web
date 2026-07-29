import { useState } from "react";

const AUTH_PANEL_STYLES = `
*{
  box-sizing:border-box;
}

.auth-wrapper{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  padding:34px 16px;
  position:relative;
  overflow:hidden;
  background:
    radial-gradient(circle at top left, rgba(20,115,148,.14), transparent 34%),
    radial-gradient(circle at bottom right, rgba(24,167,212,.13), transparent 34%),
    linear-gradient(135deg, #f7fbfd 0%, #edf6fa 45%, #f8fbfd 100%);
}

.auth-wrapper::before{
  content:"";
  position:absolute;
  width:520px;
  height:520px;
  border-radius:50%;
  background:rgba(20,115,148,.08);
  top:-210px;
  left:-180px;
  filter:blur(70px);
  pointer-events:none;
}

.auth-wrapper::after{
  content:"";
  position:absolute;
  width:520px;
  height:520px;
  border-radius:50%;
  background:rgba(24,167,212,.08);
  right:-190px;
  bottom:-220px;
  filter:blur(75px);
  pointer-events:none;
}

.auth-card{
  width:100%;
  max-width:640px;
  background:rgba(255,255,255,.94);
  backdrop-filter:blur(18px);
  -webkit-backdrop-filter:blur(18px);
  border:1px solid rgba(221,235,242,.95);
  border-top:5px solid #147394;
  border-radius:28px;
  padding:50px 60px 56px;
  box-shadow:
    0 30px 80px rgba(15,23,42,.10),
    0 12px 32px rgba(20,115,148,.09),
    inset 0 1px 0 rgba(255,255,255,.95);
  text-align:center;
  position:relative;
  z-index:2;
  overflow:hidden;
}

.auth-card::before{
  content:"";
  position:absolute;
  inset:0;
  background:
    radial-gradient(circle at top right, rgba(20,115,148,.08), transparent 35%),
    radial-gradient(circle at bottom left, rgba(24,167,212,.07), transparent 35%);
  pointer-events:none;
}

.auth-logo{
  width:370px;
  max-width:92%;
  margin:0 auto 28px;
  display:block;
  position:relative;
  z-index:1;
  filter:drop-shadow(0 12px 20px rgba(20,115,148,.12));
}

.auth-title{
  font-size:36px;
  font-weight:900;
  color:#172331;
  margin:0 0 10px;
  position:relative;
  z-index:1;
  letter-spacing:-.7px;
}

.auth-subtitle{
  font-size:18px;
  color:#687789;
  margin:0 0 28px;
  position:relative;
  z-index:1;
  font-weight:600;
}

.auth-tabs{
  background:#eef7fb;
  border:1px solid #d4e9f1;
  border-radius:16px;
  padding:5px;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:6px;
  margin:0 0 28px;
  position:relative;
  z-index:1;
}

.auth-tab{
  border:0;
  height:46px;
  border-radius:12px;
  background:transparent;
  color:#607486;
  font-size:15px;
  font-weight:900;
  cursor:pointer;
  transition:.22s;
  font-family:inherit;
}

.auth-tab.active{
  background:#fff;
  color:#147394;
  box-shadow:
    0 8px 18px rgba(20,115,148,.12),
    inset 0 1px 0 rgba(255,255,255,.95);
}

.auth-form{
  text-align:left;
  position:relative;
  z-index:1;
}

.auth-input-group{
  margin-bottom:22px;
}

.auth-input-group label{
  display:block;
  font-size:16px;
  font-weight:800;
  color:#172331;
  margin-bottom:12px;
}

.auth-input-wrap{
  position:relative;
}

.auth-input-group input,
.auth-input-group select{
  width:100%;
  height:64px;
  border:1px solid #d7e5ec;
  border-radius:16px;
  background:#fbfdfe;
  padding:0 22px;
  font-size:18px;
  color:#172331;
  outline:none;
  box-sizing:border-box;
  transition:.25s;
  box-shadow:
    0 8px 20px rgba(15,23,42,.035),
    inset 0 1px 0 rgba(255,255,255,.9);
  font-family:inherit;
  font-weight:600;
}

.auth-input-group select{
  appearance:none;
  -webkit-appearance:none;
  cursor:pointer;
  padding-right:50px;
}

.auth-select-wrap::after{
  content:"▾";
  position:absolute;
  right:22px;
  top:50%;
  transform:translateY(-50%);
  color:#147394;
  font-size:16px;
  font-weight:900;
  pointer-events:none;
}

.auth-input-group input:focus,
.auth-input-group select:focus{
  border-color:#147394;
  background:#fff;
  box-shadow:
    0 0 0 5px rgba(20,115,148,.10),
    0 12px 28px rgba(20,115,148,.10);
}

.auth-input-group input::placeholder{
  color:#7f8b99;
  font-weight:500;
}

.auth-submit{
  width:100%;
  height:66px;
  border:0;
  border-radius:16px;
  background:linear-gradient(135deg,#147394,#18a7d4);
  color:#fff;
  font-size:19px;
  font-weight:900;
  cursor:pointer;
  margin-top:18px;
  transition:.25s;
  box-shadow:
    0 18px 36px rgba(20,115,148,.28),
    inset 0 1px 0 rgba(255,255,255,.35);
  font-family:inherit;
}

.auth-submit:hover:not(:disabled){
  transform:translateY(-2px);
  box-shadow:
    0 24px 48px rgba(20,115,148,.34),
    inset 0 1px 0 rgba(255,255,255,.45);
}

.auth-submit:disabled{
  opacity:.7;
  cursor:not-allowed;
}

.auth-error{
  background:#fee2e2;
  color:#b91c1c;
  border:1px solid #fecaca;
  border-radius:14px;
  padding:12px 16px;
  margin-bottom:18px;
  font-size:15px;
  font-weight:700;
}

.auth-loader{
  width:22px;
  height:22px;
  border:3px solid rgba(255,255,255,.35);
  border-top-color:#fff;
  border-radius:50%;
  display:inline-block;
  animation:spin .8s linear infinite;
}

.auth-footer{
  margin-top:34px;
  color:#8795a6;
  font-size:16px;
  position:relative;
  z-index:1;
  text-align:center;
  font-weight:700;
}

@keyframes spin{
  to{
    transform:rotate(360deg);
  }
}

@media(max-width:768px){
  .auth-wrapper{
    padding:28px 14px;
  }

  .auth-card{
    max-width:94%;
    padding:38px 24px 42px;
    border-radius:26px;
  }

  .auth-logo{
    width:300px;
  }

  .auth-title{
    font-size:31px;
  }

  .auth-subtitle{
    font-size:16px;
  }

  .auth-input-group input,
  .auth-input-group select{
    height:58px;
    font-size:16px;
  }

  .auth-submit{
    height:60px;
    font-size:17px;
  }
}

@media(max-width:420px){
  .auth-card{
    padding:34px 20px 38px;
  }

  .auth-logo{
    width:260px;
  }

  .auth-title{
    font-size:29px;
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

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setError("");
    setForm((prev) => ({
      ...prev,
      role: prev.role || "viewer",
    }));
  };

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
    <>
      <style>{AUTH_PANEL_STYLES}</style>

      <div className="auth-wrapper">
        <div className="auth-card">
          <img
            className="auth-logo"
            src="https://erp-smart-it.odoo.com/web/image/website/1/logo/Smart%20IT"
            alt="SmartIT"
          />

          <h1 className="auth-title">
            {mode === "login" ? "Log In" : "Create Account"}
          </h1>

          <p className="auth-subtitle">
            {mode === "login"
              ? "Integrated Security & Smart Solutions"
              : "Create your Smart IT account"}
          </p>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => handleModeChange("login")}
            >
              Sign In
            </button>

            <button
              type="button"
              className={`auth-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => handleModeChange("register")}
            >
              Sign Up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            <div className="auth-input-group">
              <label>Email</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
              />
            </div>

            <div className="auth-input-group">
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
              />
            </div>

            {mode === "register" && (
              <div className="auth-input-group">
                <label>Choose Role</label>

                <div className="auth-input-wrap auth-select-wrap">
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        role: e.target.value,
                      })
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
                "Log In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="auth-footer">© SmartIT</div>
        </div>
      </div>
    </>
  );
}

export default AuthPanel;