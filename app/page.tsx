'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

type Role = 'admin' | 'mitarbeiter' | '';

type Baustelle = {
  id: number;
  nummer: string;
  name: string;
  adresse: string;
  kunde: string;
  ansprechpartner: string;
  telefon: string;
  status: string;
};

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loggedInEmail, setLoggedInEmail] = useState('');
  const [role, setRole] = useState<Role>('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [baustellen, setBaustellen] = useState<Baustelle[]>([
    {
      id: 1,
      nummer: 'BS-1001',
      name: 'Musterbaustelle',
      adresse: 'Musterstraße 1, Kiel',
      kunde: 'Musterkunde',
      ansprechpartner: 'Herr Meyer',
      telefon: '0431 / 123456',
      status: 'Aktiv',
    },
  ]);

  const [form, setForm] = useState({
    nummer: '',
    name: '',
    adresse: '',
    kunde: '',
    ansprechpartner: '',
    telefon: '',
    status: 'Aktiv',
  });

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    if (!supabase) return;

    const { data } = await supabase.auth.getUser();

    if (data.user?.email) {
      setLoggedInEmail(data.user.email);
      await loadRole(data.user.id);
    }
  }

  async function loadRole(userId: string) {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      setRole('mitarbeiter');
      return;
    }

    setRole(data?.role === 'admin' ? 'admin' : 'mitarbeiter');
  }

  async function login() {
    setError('');

    if (!supabase) {
      setError('Supabase ist nicht verbunden.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setLoggedInEmail(data.user?.email || '');
    await loadRole(data.user?.id || '');

    setEmail('');
    setPassword('');
  }

  async function logout() {
    if (!supabase) return;

    await supabase.auth.signOut();
    setLoggedInEmail('');
    setRole('');
  }

  function saveBaustelle() {
    if (!form.nummer || !form.name) {
      alert('Bitte Baustellen-Nr. und Bauvorhaben eintragen.');
      return;
    }

    setBaustellen([
      {
        id: Date.now(),
        ...form,
      },
      ...baustellen,
    ]);

    setForm({
      nummer: '',
      name: '',
      adresse: '',
      kunde: '',
      ansprechpartner: '',
      telefon: '',
      status: 'Aktiv',
    });
  }

  const modules =
    role === 'admin'
      ? [
          { title: 'Mitarbeiterverwaltung', href: '/employees' },
          { title: 'Geräteverwaltung', href: '/geraet' },
          { title: 'Angebote & Rechnungen', href: '/angebote' },
          { title: 'Bautagebuch', href: '/bautagebuch' },
          { title: 'QR-Scanner', href: '/scanner' },
        ]
      : [
          { title: 'QR-Scanner', href: '/scanner' },
          { title: 'Geräte suchen', href: '/geraet' },
          { title: 'Bautagebuch', href: '/bautagebuch' },
        ];

  const filteredBaustellen = baustellen.filter((b) =>
    `${b.nummer} ${b.name} ${b.kunde} ${b.adresse}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-5xl font-black">BauWerkzeug QR</h1>
          <p className="mt-2 text-lg font-bold text-slate-700">
            Baustellen-, Geräte- und Mitarbeiterverwaltung
          </p>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Anmeldung</h2>

          {loggedInEmail ? (
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-emerald-50 p-4">
              <div>
                <p className="text-sm font-black text-emerald-700">
                  Angemeldet
                </p>
                <p className="text-lg font-black text-emerald-900">
                  {loggedInEmail}
                </p>
                <p className="text-sm font-black text-slate-700">
                  Rolle: {role === 'admin' ? 'Admin' : 'Mitarbeiter'}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

        {loggedInEmail && (
          <>
            <section className="grid gap-4 md:grid-cols-5">
              {modules.map((module) => (
                <a
                  key={module.href}
                  href={module.href}
                  className="rounded-2xl bg-white p-5 text-center font-black shadow-sm hover:shadow-lg"
                >
                  {module.title}
                </a>
              ))}
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Suche</h2>

              <input
                placeholder="Suche nach Baustelle, Baustellen-Nr., Kunde, Gerät, Mitarbeiter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-4 text-lg font-bold placeholder:text-slate-500"
              />
            </section>

            {role === 'admin' && (
              <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-black">Baustelle anlegen</h2>

                  <div className="mt-5 space-y-3">
                    <input
                      placeholder="Baustellen-Nr."
                      value={form.nummer}
                      onChange={(e) =>
                        setForm({ ...form, nummer: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
                    />

                    <input
                      placeholder="Bauvorhaben / Baustelle"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
                    />

                    <input
                      placeholder="Adresse"
                      value={form.adresse}
                      onChange={(e) =>
                        setForm({ ...form, adresse: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
                    />

                    <input
                      placeholder="Kunde / Bauherr"
                      value={form.kunde}
                      onChange={(e) =>
                        setForm({ ...form, kunde: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
                    />

                    <input
                      placeholder="Ansprechpartner"
                      value={form.ansprechpartner}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          ansprechpartner: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
                    />

                    <input
                      placeholder="Telefon"
                      value={form.telefon}
                      onChange={(e) =>
                        setForm({ ...form, telefon: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
                    />

                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
                    >
                      <option>Aktiv</option>
                      <option>In Vorbereitung</option>
                      <option>Pausiert</option>
                      <option>Abgeschlossen</option>
                    </select>

                    <button
                      onClick={saveBaustelle}
                      className="w-full rounded-xl bg-slate-950 px-4 py-3 font-black text-white"
                    >
                      Baustelle speichern
                    </button>
                  </div>
                </div>

                <BaustellenTabelle baustellen={filteredBaustellen} />
              </section>
            )}

            {role === 'mitarbeiter' && (
              <BaustellenTabelle baustellen={filteredBaustellen} />
            )}
          </>
        )}
      </div>
    </main>
  );
}

function BaustellenTabelle({ baustellen }: { baustellen: Baustelle[] }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-2xl font-black">Baustellenübersicht</h2>

      <div className="overflow-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 font-black">Nr.</th>
              <th className="p-3 font-black">Baustelle</th>
              <th className="p-3 font-black">Kunde</th>
              <th className="p-3 font-black">Status</th>
              <th className="p-3 font-black">Aktion</th>
            </tr>
          </thead>

          <tbody>
            {baustellen.map((b) => (
              <tr key={b.id} className="border-t border-slate-200">
                <td className="p-3 font-black">{b.nummer}</td>
                <td className="p-3 font-bold">
                  <div>{b.name}</div>
                  <div className="text-xs text-slate-500">{b.adresse}</div>
                </td>
                <td className="p-3 font-bold">
                  <div>{b.kunde}</div>
                  <div className="text-xs text-slate-500">
                    {b.ansprechpartner} · {b.telefon}
                  </div>
                </td>
                <td className="p-3">
                  <span className="rounded-lg bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-800">
                    {b.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="/bautagebuch"
                      className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-black text-white"
                    >
                      Bautagebuch
                    </a>
                    <a
                      href="/geraet"
                      className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white"
                    >
                      Geräte
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}