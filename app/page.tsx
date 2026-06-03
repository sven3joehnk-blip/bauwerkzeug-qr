'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function HomePage() {
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedInEmail, setLoggedInEmail] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    if (!supabase) return;

    const { data } = await supabase.auth.getUser();

    if (data.user?.email) {
      setLoggedInEmail(data.user.email);
    }
  }

  async function login() {
    setError('');

    if (!supabase) {
      setError('Supabase ist nicht verbunden.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setLoggedInEmail(data.user?.email || '');
    setUserEmail('');
    setPassword('');
  }

  async function logout() {
    if (!supabase) return;

    await supabase.auth.signOut();
    setLoggedInEmail('');
  }

  const modules = [
    {
      title: 'Mitarbeiterverwaltung',
      text: 'Personal, Arbeitszeiten, Erste Hilfe und Arbeitssicherheit',
      href: '/employees',
      keywords: 'mitarbeiter personal stunden arbeitszeit erste hilfe sifa',
    },
    {
      title: 'Geräteverwaltung',
      text: 'Werkzeuge, Maschinen, QR-Codes, Ausgabe und Rückgabe',
      href: '/geraet',
      keywords: 'gerät geraet werkzeug maschine qr inventar ausgabe rückgabe',
    },
    {
      title: 'Angebot und Rechnungsverwaltung',
      text: 'Angebote, Rechnungen, Aufträge und Zahlungsstatus',
      href: '/angebote',
      keywords: 'angebot rechnung auftrag zahlung',
    },
    {
      title: 'Bautagebuch / Dokumentation',
      text: 'Baustellenberichte, Fotos, Notizen und Tagesleistung',
      href: '/bautagebuch',
      keywords: 'bautagebuch dokumentation baustelle foto bericht baustellennummer',
    },
  ];

  const filteredModules = modules.filter((module) =>
    `${module.title} ${module.text} ${module.keywords}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <div className="mx-auto max-w-4xl space-y-6">

        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-4xl font-black">
            BauWerkzeug QR
          </h1>

          <p className="mt-2 text-lg font-bold text-slate-700">
            Digitale Verwaltung für Bauunternehmen
          </p>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">
            Admin-Anmeldung
          </h2>

          {loggedInEmail ? (
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-emerald-50 p-4">
              <div>
                <p className="text-sm font-black text-emerald-700">
                  Angemeldet als Admin
                </p>
                <p className="text-lg font-black text-emerald-900">
                  {loggedInEmail}
                </p>
              </div>

              <button
                onClick={logout}
                className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white"
              >
                Abmelden
              </button>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input
                type="email"
                placeholder="E-Mail-Adresse"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
              />

              <input
                type="password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
              />

              <button
                onClick={login}
                className="rounded-xl bg-slate-950 px-6 py-3 font-black text-white"
              >
                Login
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-4 font-black text-red-700">
              Fehler: {error}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">
            Suche
          </h2>

          <input
            placeholder="Suche nach Mitarbeiter, Gerät, Baustellennummer, Angebot ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-4 text-lg font-bold placeholder:text-slate-500"
          />
        </section>

        <section className="space-y-4">
          {filteredModules.map((module) => (
            <a
              key={module.title}
              href={module.href}
              className="block rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-black">
                    {module.title}
                  </h2>

                  <p className="mt-2 text-base font-bold text-slate-700">
                    {module.text}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white">
                  Öffnen
                </div>
              </div>
            </a>
          ))}
        </section>

      </div>
    </main>
  );
}