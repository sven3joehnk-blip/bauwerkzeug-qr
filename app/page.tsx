'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

type Role = 'admin' | 'mitarbeiter' | '';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loggedInEmail, setLoggedInEmail] = useState('');
  const [role, setRole] = useState<Role>('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const { data } = await supabase.auth.getUser();

    if (data.user?.email) {
      setLoggedInEmail(data.user.email);

      if (data.user.email === 'sven3joehnk@gmail.com') {
        setRole('admin');
      } else {
        setRole('mitarbeiter');
      }
    }
  }

  async function login() {
    setError('');

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setError(error.message);
      return;
    }

    if (data.user?.email) {
      setLoggedInEmail(data.user.email);

      if (data.user.email === 'sven3joehnk@gmail.com') {
        setRole('admin');
      } else {
        setRole('mitarbeiter');
      }
    }

    setEmail('');
    setPassword('');
  }

  async function logout() {
    await supabase.auth.signOut();

    setLoggedInEmail('');
    setRole('');
  }

  const adminCards = [
    {
      title: 'Mitarbeiter',
      text: 'Personal, Stunden, Erste Hilfe, SiFa',
      href: '/employees',
      color: 'bg-blue-600',
    },

    {
      title: 'Geräte',
      text: 'Werkzeuge, QR-Codes, Ausgabe',
      href: '/geraet',
      color: 'bg-emerald-600',
    },

    {
      title: 'Angebote',
      text: 'Angebote und Rechnungen',
      href: '/angebote',
      color: 'bg-violet-600',
    },

    {
      title: 'Dokumentation',
      text: 'Bautagebuch und Bilder',
      href: '/bautagebuch',
      color: 'bg-orange-500',
    },

    {
      title: 'Scanner',
      text: 'QR-Code Scanner',
      href: '/scanner',
      color: 'bg-slate-950',
    },
  ];

  const employeeCards = [
    {
      title: 'Geräte',
      text: 'Werkzeuge und QR-Codes',
      href: '/geraet',
      color: 'bg-emerald-600',
    },

    {
      title: 'Dokumentation',
      text: 'Bautagebuch und Bilder',
      href: '/bautagebuch',
      color: 'bg-orange-500',
    },

    {
      title: 'Scanner',
      text: 'QR-Code Scanner',
      href: '/scanner',
      color: 'bg-slate-950',
    },
  ];

  const cards =
    role === 'admin'
      ? adminCards
      : employeeCards;

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">

      <div className="mx-auto max-w-7xl space-y-6">

        <header className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h1 className="text-5xl font-black">
                DigiDokuBau
              </h1>

              <p className="mt-3 text-xl font-bold text-slate-600">
                Digitale Baustellenverwaltung
              </p>

            </div>

            {loggedInEmail ? (

              <div className="rounded-2xl bg-slate-100 p-5">

                <p className="text-sm font-black text-slate-500">
                  Angemeldet
                </p>

                <p className="text-xl font-black">
                  {loggedInEmail}
                </p>

                <p className="mt-1 text-sm font-black text-slate-600">
                  Rolle: {role === 'admin'
                    ? 'Administrator'
                    : 'Mitarbeiter'}
                </p>

                <button
                  onClick={logout}
                  className="mt-4 rounded-xl bg-slate-950 px-5 py-3 font-black text-white"
                >
                  Abmelden
                </button>

              </div>

            ) : (

              <div className="w-full max-w-xl space-y-3">

                <input
                  type="email"
                  placeholder="E-Mail-Adresse"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-lg font-bold"
                />

                <input
                  type="password"
                  placeholder="Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-lg font-bold"
                />

                <button
                  onClick={login}
                  className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-lg font-black text-white"
                >
                  Login
                </button>

                {error && (
                  <div className="rounded-2xl bg-red-50 p-4 font-black text-red-700">
                    {error}
                  </div>
                )}

              </div>

            )}

          </div>

        </header>

        {loggedInEmail && (

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">

            {cards.map((card) => (

              <a
                key={card.href}
                href={card.href}
                className={`${card.color} rounded-3xl p-8 text-white shadow-sm transition hover:scale-[1.02] hover:shadow-xl`}
              >

                <div className="flex h-full flex-col justify-between">

                  <div>

                    <h2 className="text-3xl font-black">
                      {card.title}
                    </h2>

                    <p className="mt-3 text-base font-bold text-white/90">
                      {card.text}
                    </p>

                  </div>

                  <div className="mt-8 text-sm font-black uppercase tracking-wider">
                    Öffnen →
                  </div>

                </div>

              </a>

            ))}

          </section>

        )}

      </div>

    </main>
  );
}