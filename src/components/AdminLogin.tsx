import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from "@/services/auth";
import bakeryLogo from "@/assets/logo.jpg";


const AdminLogin: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const validateEmail = (e: string) => {
    return /^\S+@\S+\.\S+$/.test(e);
  };

  const submit = (ev?: React.FormEvent) => {
    ev?.preventDefault();
    setError("");
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    apiLogin(email, password)
      .then((data) => {
        setLoading(false);
        if (onSuccess) onSuccess();
        else navigate("/admin");
      })
      .catch((err: Error) => {
        setLoading(false);
        setError(err.message || 'Login failed');
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFF6EA] via-[#FFF1E0] to-[#F7E9FF]">
      {/* decorative floating shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-pink-200 opacity-30 rounded-full blur-3xl transform rotate-12"></div>
        <div className="absolute right-10 top-10 w-48 h-48 bg-yellow-200 opacity-30 rounded-full blur-2xl"></div>
        <div className="absolute left-1/2 bottom-10 w-72 h-72 bg-indigo-100 opacity-25 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 overflow-hidden">
                <img src={bakeryLogo} alt="Bakery Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Admin Sign in</h2>
                <p className="text-sm text-slate-500">Secure access to your bakery dashboard</p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="text-sm text-slate-600">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@bakery.com"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm"
                  aria-label="Email"
                />
              </label>

              <label className="block">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Password</span>
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="text-xs text-amber-500 hover:underline"
                  >
                    {showPwd ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="mt-1 relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-28 focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm"
                    aria-label="Password"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">min 6 chars</span>
                </div>
              </label>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" /> Remember me
                </label>
                <a href="#" className="text-sm text-amber-500 hover:underline">Forgot?</a>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-pink-400 text-white font-semibold shadow-md hover:scale-[1.02] transform transition"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>

            <p className="text-xs text-slate-500">By signing in you agree to the bakery dashboard Terms and Privacy.</p>
          </div>

          <div className="hidden md:flex items-center justify-center bg-gradient-to-b from-amber-50 to-pink-50 p-8">
            <div className="max-w-xs text-center">
              <img src={bakeryLogo} alt="Bakery Logo" className="mx-auto w-56 h-56 object-contain drop-shadow-xl hover:scale-105 transition-transform duration-700" />
              <h3 className="mt-4 text-lg font-semibold text-slate-800">Welcome back!</h3>
              <p className="mt-2 text-sm text-slate-600">Manage products, view orders, and customize the storefront. Make something delicious today.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">Need a different account? <a href="#" className="text-amber-500 hover:underline">Contact support</a></div>
      </div>
    </div>
  );
};

export default AdminLogin;
