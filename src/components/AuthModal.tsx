import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  Leaf,
  Sparkles,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Gift,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  const { login, signup, googleSignIn, isLoading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  // Google/Email always available
  const gButton = (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setErr("");
        setOk(false);
        setLoading(true);
        try {
          await googleSignIn();
          setOk(true);
          setLoading(false);
          showSuccess("Successfully signed in with Google!");
          setTimeout(() => {
            onClose();
            setOk(false);
            onAuthSuccess?.();
          }, 1000);
        } catch (error: any) {
          setLoading(false);
          setOk(false);
          const errorMsg = error?.message || "Google sign-in failed";
          setErr(errorMsg);
          showError(errorMsg);
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }}
      className="text-[15px] font-medium flex items-center justify-center gap-2 w-full rounded-xl px-4 py-3 border border-gray-200 bg-white hover:bg-green-50 duration-150 shadow-sm disabled:opacity-60"
      disabled={loading || authLoading}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>Continue with Google</span>
    </button>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || authLoading) return;
    
    // Validation
    if (!email || !email.includes('@')) {
      const errorMsg = "Please enter a valid email address";
      setErr(errorMsg);
      showError(errorMsg);
      return;
    }
    
    if (!pass || pass.length < 6) {
      const errorMsg = "Password must be at least 6 characters";
      setErr(errorMsg);
      showError(errorMsg);
      return;
    }
    
    if (!isLogin && (!name || name.trim().length < 2)) {
      const errorMsg = "Please enter your full name (at least 2 characters)";
      setErr(errorMsg);
      showError(errorMsg);
      return;
    }
    
    setErr("");
    setOk(false);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, pass);
        showSuccess("Welcome back! Successfully signed in.");
      } else {
        await signup(name, email, pass);
        showSuccess("Account created successfully! Welcome to AgriSeal AI.");
      }
      setOk(true);
      setLoading(false);
      setTimeout(() => {
        onClose();
        setOk(false);
        onAuthSuccess?.();
        setEmail(""); setPass(""); setName("");
      }, 900);
    } catch (error: any) {
      setLoading(false);
      setOk(false);
      const errorMsg = error?.message || (isLogin ? "Login failed. Please check your credentials." : "Signup failed. Please try again.");
      setErr(errorMsg);
      showError(errorMsg);
    }
  };

  useEffect(() => { setErr(""); setOk(false) }, [isLogin]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="max-w-xs w-full rounded-2xl bg-white shadow-2xl overflow-hidden relative animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute -top-4 right-4 z-10">
          <button
            type="button"
            disabled={loading || authLoading}
            onClick={onClose}
            className="bg-white rounded-full p-2 shadow hover:bg-green-100 disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 pt-9">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <Sparkles className="absolute -top-2 -right-1 w-3 h-3 text-amber-400 animate-bounce" />
            </div>
            <span className="text-lg font-extrabold text-green-700">AgriSeal AI</span>
          </div>
          <h2 className="font-bold text-xl text-gray-900">
            {ok ? "🎉 Welcome!" : isLogin ? "Sign in" : "Create account"}
          </h2>
          <div className="text-gray-500 text-xs mb-4">
            {ok
              ? "You’re set to revolutionize your crops."
              : isLogin
              ? "Login to access your AI tools"
              : "Start your free journey with 1 credit"}
          </div>

          {ok ? (
            <div className="animate-fadeIn text-center my-6">
              <div className="mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-full p-3 w-14 h-14 flex mb-3 justify-center items-center ring-4 ring-green-100">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="mx-auto flex items-center justify-center gap-2 mt-4 bg-green-50 p-2 px-3 rounded-lg border border-green-100 w-max">
                <Gift className="w-4 h-4 text-green-400" />
                <span className="text-green-800 font-semibold text-sm">
                  1 Free Credit
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-4">
                Enjoy your bonus and AI features!
              </div>
              <button
                type="button"
                className="w-full mt-7 py-2 rounded-xl font-bold text-white transition bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={onClose}
              >
                Go → Dashboard
              </button>
            </div>
          ) : (
            <>
              {gButton}
              <div className="py-3 text-center flex items-center justify-center gap-3 text-xs text-gray-400">
                <span className="flex-1 border-t" />
                <span>or</span>
                <span className="flex-1 border-t" />
              </div>
              <div className="flex mb-4 rounded-lg overflow-hidden border bg-gray-50 border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  disabled={loading || authLoading}
                  className={`flex-1 py-2 text-sm font-bold transition ${isLogin ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" : "text-gray-600 hover:bg-white"}`}
                >Sign In</button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  disabled={loading || authLoading}
                  className={`flex-1 py-2 text-sm font-bold transition ${!isLogin ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" : "text-gray-600 hover:bg-white"}`}
                >Sign Up</button>
              </div>
              {err && (
                <div className="mb-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg px-3 py-2 flex items-start gap-2 animate-shake">
                  <AlertCircle className="min-w-4 min-h-4 w-4 h-4 mt-0.5" />
                  <span className="flex-1">{err}</span>
                  <button
                    type="button"
                    onClick={() => setErr("")}
                    className="text-gray-400 hover:text-red-500 -my-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      className="w-full py-2 pl-10 pr-3 rounded-lg border border-gray-200 focus:border-green-400 outline-none bg-white text-sm"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Full Name"
                      disabled={loading || authLoading}
                      required
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    className="w-full py-2 pl-10 pr-3 rounded-lg border border-gray-200 focus:border-green-400 outline-none bg-white text-sm"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email"
                    disabled={loading || authLoading}
                    required
                    autoFocus
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type={show ? "text" : "password"}
                    className="w-full py-2 pl-10 pr-10 rounded-lg border border-gray-200 focus:border-green-400 outline-none bg-white text-sm"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    placeholder="Password"
                    minLength={6}
                    disabled={loading || authLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    tabIndex={-1}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-green-500"
                    aria-label={show ? "Hide password" : "Show password"}
                    disabled={loading || authLoading}
                  >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!isLogin && (
                  <div className="flex items-center gap-2 text-[11px] mt-1 text-gray-500 select-none">
                    <input type="checkbox" required className="accent-green-500 w-4 h-4 rounded" disabled={loading || authLoading} />
                    I agree to <span className="underline text-green-600">Terms</span> and receive <b className="text-green-700">1 credit</b>!
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full mt-2 py-2 rounded-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition"
                  disabled={loading || authLoading}
                >
                  {loading || authLoading ? (
                    <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-4 h-4" />{isLogin ? "Signing In..." : "Signing Up..."}</span>
                  ) : isLogin ? "Sign In" : "Sign Up Free"}
                </button>
              </form>
              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 mt-6 mb-1">
                <ShieldCheck className="w-3 h-3 text-green-500" />
                Secure &amp; Private
              </div>
            </>
          )}
        </div>
        <style>{`
          .animate-fadeIn { animation: fadeIn 260ms cubic-bezier(.21,1,.13,1); }
          .animate-shake { animation: shake 220ms cubic-bezier(.21,1,.13,1); }
          @keyframes fadeIn { from{opacity:0} to{opacity:1} }
          @keyframes shake { 0%,100%{transform:translateX(0);} 20%,60%{transform:translateX(-4px);} 40%,80%{transform:translateX(4px);} }
        `}</style>
      </div>
    </div>
  );
};

export default AuthModal;