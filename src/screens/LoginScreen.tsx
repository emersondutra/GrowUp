import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Fingerprint,
  ArrowRight,
  ShieldCheck,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { auth, googleAuthProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { syncUserWithDb } from '../services/apiService';

interface LoginScreenProps {
  onLogin: (userEmail: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('emerson.dutra@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);
    setTimeout(() => {
      setIsAuthenticating(false);
      syncUserWithDb({
        uid: `user-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email,
        displayName: email.split('@')[0],
      });
      onLogin(email);
    }, 600);
  };

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      if (user && user.email) {
        await syncUserWithDb({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || undefined,
          photoUrl: user.photoURL || undefined,
        });
        onLogin(user.email);
      }
    } catch (err: any) {
      console.warn('Google Sign-In popup error/dismissed:', err);
      // If popup was closed by user or cancelled, fall back to email login
      if (err?.code !== 'auth/popup-closed-by-user') {
        setAuthError('Autenticação com Google indisponível ou cancelada.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleBiometricLogin = () => {
    setBiometricScanning(true);
    setTimeout(() => {
      setBiometricScanning(false);
      syncUserWithDb({
        uid: `user-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email,
        displayName: 'Emerson Dutra',
      });
      onLogin(email);
    }, 800);
  };

  const handleDemoAccess = () => {
    setEmail('emerson.dutra@gmail.com');
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      syncUserWithDb({
        uid: 'user-emerson_dutra',
        email: 'emerson.dutra@gmail.com',
        displayName: 'Emerson Dutra',
      });
      onLogin('emerson.dutra@gmail.com');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex flex-col justify-between p-4 selection:bg-[#38bdf8] selection:text-[#051424] relative overflow-hidden">
      {/* Background radial glowing ambient orbs */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-80 h-80 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Telemetry Ticker Ribbon */}
      <div className="w-full max-w-md mx-auto py-1 px-3 bg-[#090d16]/80 backdrop-blur-md rounded-full border border-[#1e293b] flex items-center justify-between text-[10px] font-mono-numbers select-none">
        <div className="flex items-center gap-1 text-[#10b981]">
          <span className="text-[9px]">🇧🇷</span>
          <span>IBOV: 128.450</span>
          <span className="font-bold">+0,6%</span>
        </div>
        <div className="w-px h-2.5 bg-[#1e293b]" />
        <div className="flex items-center gap-1 text-[#10b981]">
          <span className="text-[9px]">🇺🇸</span>
          <span>S&P: 5.864</span>
          <span className="font-bold">+0,4%</span>
        </div>
        <div className="w-px h-2.5 bg-[#1e293b]" />
        <div className="flex items-center gap-1 text-[#38bdf8]">
          <span>FX: R$ 5,50</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size="xl" showWordmark={false} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Grow<span className="text-[#38bdf8]">Up</span>
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1 max-w-xs mx-auto font-display">
            Sovereign Dual-Market Wealth • B3 & Wall Street
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-gradient-to-b from-[#0d1c2d] to-[#091523] border border-[#1e293b] rounded-2xl p-5 shadow-2xl relative">
          {/* Segmented Auth Selector */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#051424] rounded-xl border border-[#1e293b] mb-4 font-display">
            <button
              type="button"
              onClick={() => setAuthMode('LOGIN')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'LOGIN'
                  ? 'bg-[#38bdf8] text-[#051424] shadow-md'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Entrar na Conta
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('REGISTER')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'REGISTER'
                  ? 'bg-[#38bdf8] text-[#051424] shadow-md'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {authError && (
            <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email / CPF */}
            <div>
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display block mb-1">
                E-mail ou CPF
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu.email@exemplo.com"
                  className="w-full bg-[#051424] border border-[#1e293b] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#94a3b8] focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/30 font-mono-numbers transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider font-display">
                  Senha Institucional
                </label>
                {authMode === 'LOGIN' && (
                  <button
                    type="button"
                    onClick={() => alert('Link de recuperação enviado para o e-mail cadastrado.')}
                    className="text-[10px] text-[#38bdf8] hover:underline font-display"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-[#051424] border border-[#1e293b] rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-[#94a3b8] focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/30 font-mono-numbers transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#1e293b] bg-[#051424] text-[#38bdf8] accent-[#38bdf8] cursor-pointer"
                />
                <span className="text-xs text-[#94a3b8] font-display">
                  Manter conectado neste dispositivo
                </span>
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isAuthenticating || biometricScanning}
              className="w-full py-3 px-4 bg-[#38bdf8] hover:bg-[#7bd0ff] text-[#051424] font-bold text-xs rounded-xl font-display flex items-center justify-center gap-2 shadow-lg shadow-[#38bdf8]/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-1 cursor-pointer"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#051424] border-t-transparent rounded-full animate-spin" />
                  <span>Autenticando no Terminal GrowUp...</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'LOGIN' ? 'Entrar no Terminal GrowUp' : 'Criar Nova Carteira GrowUp'}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1e293b]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-display font-semibold">
              <span className="bg-[#0d1c2d] px-2 text-[#94a3b8]">ou conecte com</span>
            </div>
          </div>

          {/* Google Sign-In & Biometrics & Fast Track */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating || biometricScanning}
              className="w-full py-2.5 px-3 bg-[#051424] hover:bg-[#122131] border border-[#1e293b] hover:border-[#38bdf8]/50 rounded-xl text-xs font-semibold text-white font-display flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com Google</span>
            </button>

            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={biometricScanning || isAuthenticating}
              className="w-full py-2 px-3 bg-[#051424] hover:bg-[#122131] border border-[#1e293b] rounded-xl text-xs font-semibold text-white font-display flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Fingerprint className={`w-4 h-4 ${biometricScanning ? 'text-[#10b981] animate-pulse' : 'text-[#38bdf8]'}`} />
              <span>{biometricScanning ? 'Verificando Face ID / Biometria...' : 'Acesso Rápido por Biometria / Face ID'}</span>
            </button>

            {/* 1-Click Executive Demo */}
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-[#122b44]/80 to-[#0e2133]/80 hover:from-[#163554] hover:to-[#12293f] border border-[#38bdf8]/40 rounded-xl text-xs font-bold text-[#8ed5ff] font-display flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ffb95f]" />
              <span>Entrar como Emerson Dutra (Demo Executivo)</span>
            </button>
          </div>
        </div>

        {/* Security & Regulatory Footnote */}
        <div className="mt-5 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#94a3b8]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Criptografia ponta a ponta 256-bit • CEI / B3 & FINRA / SIPC</span>
          </div>
          <p className="text-[10px] text-[#94a3b8]/70">
            GrowUp Gestão de Recursos • Terminal Institucional Multi-Custódia
          </p>
        </div>
      </div>

      {/* Bottom Language & Status */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between text-[10px] text-[#94a3b8] pt-2 border-t border-[#1e293b]/50">
        <div className="flex items-center gap-1">
          <Globe className="w-3 h-3 text-[#38bdf8]" />
          <span>Português (Brasil) • USD/BRL</span>
        </div>
        <div className="flex items-center gap-1 text-[#10b981]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span>PostgreSQL & B3 Online</span>
        </div>
      </div>
    </div>
  );
};
