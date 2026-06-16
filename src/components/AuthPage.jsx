import { useState } from "react";

const styles = `
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
  max-width:620px;
  background:rgba(255,255,255,.94);
  backdrop-filter:blur(18px);
  -webkit-backdrop-filter:blur(18px);
  border:1px solid rgba(221,235,242,.95);
  border-top:5px solid #147394;
  border-radius:28px;
  padding:50px 58px 56px;
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
  margin:0 0 36px;
  position:relative;
  z-index:1;
  font-weight:600;
}

.auth-form{
  text-align:left;
  position:relative;
  z-index:1;
}

.auth-input-group{
  margin-bottom:24px;
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

.auth-input-group input{
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

.auth-input-group input:focus{
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

.auth-input-wrap input{
  padding-right:58px;
}

.auth-eye{
  position:absolute;
  right:18px;
  top:50%;
  transform:translateY(-50%);
  width:34px;
  height:34px;
  border:0;
  border-radius:50%;
  background:rgba(20,115,148,.06);
  cursor:pointer;
  color:#64748b;
  display:flex;
  align-items:center;
  justify-content:center;
  transition:.2s;
}

.auth-eye svg{
  width:18px;
  height:18px;
  stroke:currentColor;
}

.auth-eye:hover{
  background:rgba(20,115,148,.12);
  color:#147394;
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
  margin-top:22px;
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

  .auth-input-group input{
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

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6A2 2 0 0 0 13.4 13.4" />
      <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 8 10 8a17.8 17.8 0 0 1-3.1 4.2" />
      <path d="M6.6 6.7C3.6 8.7 2 12 2 12s3.5 8 10 8a10.7 10.7 0 0 0 4.7-1.1" />
    </svg>
  );
}

export function AuthPage({ onLogin, loading }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        <div className="auth-card">
          <img
            className="auth-logo"
            src="https://erp-smart-it.odoo.com/web/image/website/1/logo/Smart%20IT"
            alt="SmartIT"
          />

          <h1 className="auth-title">Log In</h1>

          <p className="auth-subtitle">
            Integrated Security & Smart Solutions
          </p>

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
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>

            <div className="auth-input-group">
              <label>Password</label>

              <div className="auth-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />

                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-loader"></span> : "Log In"}
            </button>
          </form>

          <div className="auth-footer">© SmartIT</div>
        </div>
      </div>
    </>
  );
}

export { AuthPage as AuthPanel };

export default AuthPage;