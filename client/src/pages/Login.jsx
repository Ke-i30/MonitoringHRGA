import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../api';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  UserPlus, 
  Building, 
  CheckCircle2, 
  User, 
  KeyRound, 
  RefreshCw, 
  ArrowLeft, 
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  Layers
} from 'lucide-react';
import loginHeroImg from '../assets/login-hero.webp';

export const Login = () => {
  const { initiateLogin, verifyOtp, resendOtp } = useAuth();
  
  const [viewState, setViewState] = useState('LOGIN'); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);

  const [resendTimer, setResendTimer] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  useEffect(() => {
    if (viewState === 'REGISTER') {
      loadPublicDepartments();
    }
  }, [viewState]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const loadPublicDepartments = async () => {
    try {
      const res = await fetchApi('/auth/departments');
      setDepartments(res.departments || []);
      if (res.departments && res.departments.length > 0) {
        setDepartmentId(res.departments[0].id);
      }
    } catch (err) {
      console.error('Failed to load public departments:', err);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (!email || !password) {
      setError('Silakan masukkan email dan password.');
      return;
    }

    setLoading(true);
    try {
      const res = await initiateLogin(email, password);
      if (res.requireOtp) {
        setViewState('OTP');
        setOtpDigits(['', '', '', '', '', '']);
        setInfoMsg(res.message || 'Kode OTP telah dikirimkan ke email Anda.');
        setResendTimer(30);
      }
    } catch (err) {
      setError(err.message || 'Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const digits = pasted.split('');
    const updated = ['', '', '', '', '', ''];
    digits.forEach((d, i) => {
      if (i < 6) updated[i] = d;
    });
    setOtpDigits(updated);
    
    const nextFocusIndex = Math.min(digits.length, 5);
    otpInputRefs.current[nextFocusIndex]?.focus();
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setError('Silakan masukkan 6 digit kode OTP secara lengkap.');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email, fullOtp);
    } catch (err) {
      setError(err.message || 'Kode OTP salah atau kadaluwarsa.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    setInfoMsg('');
    setLoading(true);
    try {
      const res = await resendOtp(email);
      setInfoMsg(res.message || 'Kode OTP baru telah dikirim ke email Anda.');
      setResendTimer(30);
    } catch (err) {
      setError(err.message || 'Gagal mengirim ulang OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (!name || !email || !password || !departmentId) {
      setError('Semua kolom formulir pendaftaran wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          department_id: parseInt(departmentId)
        })
      });

      setInfoMsg(res.message || 'Pendaftaran berhasil. Silakan masuk dengan akun Anda.');
      setViewState('LOGIN');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Gagal mendaftar akun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split-wrapper">
      <div className="login-split-card">
        <div className="login-left-panel">
          <div>
            <div className="auth-brand-logo">
              <div className="auth-brand-icon">
                <Layers size={22} />
              </div>
              <span className="auth-brand-title">LAVANILA HRGA</span>
            </div>

            {viewState === 'LOGIN' && (
              <>
                <h2 className="auth-heading">Selamat Datang</h2>
                <p className="auth-subheading">Masukkan email & password untuk masuk.</p>
              </>
            )}

            {viewState === 'OTP' && (
              <>
                <h2 className="auth-heading">Verifikasi Kode OTP</h2>
                <p className="auth-subheading">
                  Masukkan 6-digit kode OTP ke <strong>{email}</strong>
                </p>
              </>
            )}

            {viewState === 'REGISTER' && (
              <>
                <h2 className="auth-heading">Daftar Supervisor</h2>
                <p className="auth-subheading">Lengkapi formulir pendaftaran supervisor.</p>
              </>
            )}

            {infoMsg && (
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0284c7', padding: '12px 14px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, marginBottom: '2px' }}>
                  <CheckCircle2 size={16} /> Informasi
                </div>
                {infoMsg}
              </div>
            )}

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px 14px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, marginBottom: '2px' }}>
                  <AlertCircle size={16} /> Terjadi Kesalahan
                </div>
                {error}
              </div>
            )}

            {viewState === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit}>
                <div className="input-icon-group">
                  <Mail size={18} className="input-icon-left" />
                  <input
                    type="email"
                    className="form-input-split"
                    placeholder="Email Perusahaan (misal: spv.sales@company.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-icon-group">
                  <Lock size={18} className="input-icon-left" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input-split"
                    placeholder="Password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div 
                    className="input-icon-right" 
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-split-primary"
                  disabled={loading}
                >
                  {loading ? 'Mengirim Kode OTP...' : (
                    <>
                      Lanjut Otentikasi OTP <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {viewState === 'OTP' && (
              <form onSubmit={handleOtpSubmit}>
                <div className="otp-digit-grid" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="otp-digit-input"
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn-split-primary"
                  disabled={loading}
                >
                  {loading ? 'Memverifikasi Kode OTP...' : (
                    <>
                      <ShieldCheck size={18} /> Verifikasi & Masuk System
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', fontSize: '0.85rem' }}>
                  <button
                    type="button"
                    onClick={() => { setViewState('LOGIN'); setError(''); setInfoMsg(''); }}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                  >
                    <ArrowLeft size={16} /> Ubah Email
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: resendTimer > 0 ? '#94a3b8' : '#2563eb',
                      cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    {resendTimer > 0 ? `Kirim Ulang (${resendTimer}s)` : 'Kirim Ulang OTP'}
                  </button>
                </div>
              </form>
            )}

            {viewState === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit}>
                <div className="input-icon-group">
                  <User size={18} className="input-icon-left" />
                  <input
                    type="text"
                    className="form-input-split"
                    placeholder="Nama Lengkap Supervisor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-icon-group">
                  <Mail size={18} className="input-icon-left" />
                  <input
                    type="email"
                    className="form-input-split"
                    placeholder="Email Perusahaan"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-icon-group">
                  <Building size={18} className="input-icon-left" />
                  <select
                    className="form-input-split"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    required
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div className="input-icon-group">
                  <Lock size={18} className="input-icon-left" />
                  <input
                    type="password"
                    className="form-input-split"
                    placeholder="Kata Sandi (Minimal 6 karakter)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-split-primary"
                  disabled={loading}
                >
                  {loading ? 'Mengirim Pendaftaran...' : (
                    <>
                      <UserPlus size={18} /> Kirim Pendaftaran Supervisor
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {viewState !== 'OTP' && (
            <div className="auth-toggle-text">
              {viewState === 'LOGIN' ? (
                <>
                  Belum memiliki akun Supervisor?
                  <button type="button" onClick={() => { setViewState('REGISTER'); setError(''); setInfoMsg(''); }}>
                    Daftar Sekarang
                  </button>
                </>
              ) : (
                <>
                  Sudah memiliki akun?
                  <button type="button" onClick={() => { setViewState('LOGIN'); setError(''); setInfoMsg(''); }}>
                    Masuk ke Akun
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="login-right-panel">
          <img 
            src={loginHeroImg} 
            alt="Lavanilla Photography & Printing Timeline" 
            className="hero-full-bg-image"
          />
          <div className="hero-full-overlay" />
        </div>
      </div>
    </div>
  );
};
