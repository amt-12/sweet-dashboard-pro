import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/admin");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background watermark */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   font-playfair font-extrabold tracking-widest text-navy/[0.04]
                   whitespace-nowrap select-none pointer-events-none"
        style={{ fontSize: "clamp(6rem, 18vw, 16rem)" }}
      >
        BAKERY
      </div>

      {/* Back link */}
      <Link
        to="/"
        className="absolute top-6 left-6 text-navy/60 hover:text-navy text-sm font-medium
                   no-underline flex items-center gap-2 transition-colors"
      >
        ← Back to site
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl
                      shadow-2xl shadow-navy/15 border border-navy/8 overflow-hidden">

        {/* Top decoration bar */}
        <div className="h-1.5 bg-gradient-to-r from-gold via-bread-brown to-navy" />

        <div className="px-8 pt-10 pb-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-parchment
                            rounded-2xl shadow-md mb-4 text-3xl animate-float-up">
              🧁
            </div>
            <h1 className="font-playfair text-3xl font-bold text-navy tracking-wide">
              Welcome Back
            </h1>
            <p className="text-navy/50 text-sm mt-2">
              Sign in to access your admin panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-[0.85rem] font-semibold text-navy/80 tracking-wide">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="admin@sweetbake.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border border-navy/15 rounded-xl px-4 py-3.5 text-navy text-[0.95rem]
                           bg-parchment/50 outline-none transition-all
                           focus:border-gold focus:ring-2 focus:ring-gold/15 focus:bg-white
                           placeholder:text-navy/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-[0.85rem] font-semibold text-navy/80 tracking-wide">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border border-navy/15 rounded-xl px-4 py-3.5 text-navy text-[0.95rem]
                           bg-parchment/50 outline-none transition-all
                           focus:border-gold focus:ring-2 focus:ring-gold/15 focus:bg-white
                           placeholder:text-navy/30"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-navy/60">
                <input type="checkbox" className="rounded accent-gold" />
                Remember me
              </label>
              <button type="button" className="text-gold bg-transparent border-none cursor-pointer text-sm hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-navy text-white border-none py-4 rounded-full font-semibold
                         text-base cursor-pointer transition-all duration-200
                         hover:bg-navy-lt hover:-translate-y-0.5 hover:shadow-xl hover:shadow-navy/30
                         disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in to Dashboard"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-navy/10" />
            <span className="text-navy/40 text-xs">or continue as</span>
            <div className="flex-1 h-px bg-navy/10" />
          </div>

          {/* Demo hint */}
          <p className="text-center text-xs text-navy/40">
            Use any email + password to access the demo dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
