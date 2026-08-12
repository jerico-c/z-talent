import { useState } from 'react';
import { createFileRoute, useRouter, Link } from '@tanstack/react-router';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handler untuk Email & Password
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mencegah error jika Firebase belum siap dimuat
    if (!auth) {
      setError("Sistem autentikasi belum siap. Pastikan konfigurasi Firebase Anda benar.");
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // Jika berhasil, arahkan ke dasbor
      router.navigate({ to: '/dashboard' });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk Google Login
  const handleGoogleAuth = async () => {
    // Mencegah error jika Firebase belum siap dimuat
    if (!auth) {
      setError("Sistem autentikasi belum siap. Pastikan konfigurasi Firebase Anda benar.");
      return;
    }

    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.navigate({ to: '/dashboard' });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/">
            <img src="/logo.png" alt="Z-Talent Logo" className="h-12 w-auto mb-6 hover:opacity-80 transition-opacity" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {isLogin ? 'Selamat Datang Kembali!' : 'Mulai Perjalananmu'}
          </h1>
          <p className="text-slate-500 text-sm mt-2 text-center">
            {isLogin 
              ? 'Masuk untuk melanjutkan pengembangan kariermu.' 
              : 'Daftar sekarang dan wujudkan potensi emasmu bersama Z-Talent.'}
          </p>
        </div>

        {/* Form Login/Register */}
        <form onSubmit={handleEmailAuth} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="nama@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="focus-visible:ring-orange-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="focus-visible:ring-orange-500"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-6 text-md font-semibold transition-all"
          >
            {loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar Akun')}
          </Button>
        </form>

        <div className="my-6 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-slate-200 after:mt-0.5 after:flex-1 after:border-t after:border-slate-200">
          <p className="mx-4 mb-0 text-center text-sm text-slate-500 font-medium">Atau</p>
        </div>

        {/* Tombol Google */}
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full rounded-xl py-6 border-slate-200 text-slate-700 hover:bg-slate-50 font-medium flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Lanjutkan dengan Google
        </Button>

        {/* Toggle Login/Register */}
        <p className="mt-8 text-center text-sm text-slate-600">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-bold text-orange-500 hover:text-orange-600 hover:underline"
          >
            {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
          </button>
        </p>
      </div>
    </div>
  );
}