'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError('');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <form
        onSubmit={login}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm"
      >
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          BauWerkzeug Login
        </h1>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-slate-900"
            required
          />

          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-slate-900"
            required
          />
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? 'Einloggen...' : 'Einloggen'}
        </button>
      </form>
    </main>
  );
}