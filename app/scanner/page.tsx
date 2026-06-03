'use client';

import { useMemo, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

type Status = 'Verfügbar' | 'Ausgegeben' | 'Defekt' | 'Prüfung fällig';

type Geraet = {
  inventar: string;
  bezeichnung: string;
  kategorie: string;
  hersteller: string;
  seriennummer: string;
  lagerort: string;
  status: Status;
  mitarbeiter: string;
  pruefung: string;
};

export default function GeraetePage() {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  const [geraete, setGeraete] = useState<Geraet[]>([
    {
      inventar: 'G-1001',
      bezeichnung: 'Hilti TE70 Bohrhammer',
      kategorie: 'Bohrhammer',
      hersteller: 'Hilti',
      seriennummer: 'TE70-001',
      lagerort: 'Lager Kiel',
      status: 'Verfügbar',
      mitarbeiter: '-',
      pruefung: '2026-08-12',
    },
  ]);

  const [form, setForm] = useState<Geraet>({
    inventar: '',
    bezeichnung: '',
    kategorie: '',
    hersteller: '',
    seriennummer: '',
    lagerort: '',
    status: 'Verfügbar',
    mitarbeiter: '-',
    pruefung: '',
  });

  const filtered = useMemo(() => {
    const value = search.toLowerCase();
    return geraete.filter((g) =>
      `${g.inventar} ${g.bezeichnung} ${g.kategorie} ${g.hersteller} ${g.lagerort}`
        .toLowerCase()
        .includes(value)
    );
  }, [geraete, search]);

  function saveGeraet() {
    if (!form.bezeichnung.trim()) return;

    const inventar = form.inventar || `G-${1000 + geraete.length + 1}`;

    const item: Geraet = {
      ...form,
      inventar,
      status: form.status || 'Verfügbar',
      mitarbeiter: form.mitarbeiter || '-',
    };

    if (editing) {
      setGeraete(geraete.map((g) => (g.inventar === editing ? item : g)));
      setEditing(null);
    } else {
      setGeraete([item, ...geraete]);
    }

    setForm({
      inventar: '',
      bezeichnung: '',
      kategorie: '',
      hersteller: '',
      seriennummer: '',
      lagerort: '',
      status: 'Verfügbar',
      mitarbeiter: '-',
      pruefung: '',
    });
  }

  function editGeraet(g: Geraet) {
    setEditing(g.inventar);
    setForm(g);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function ausgeben(inventar: string) {
    const name = prompt('An welchen Mitarbeiter ausgeben?');
    if (!name) return;

    setGeraete(
      geraete.map((g) =>
        g.inventar === inventar
          ? { ...g, status: 'Ausgegeben', mitarbeiter: name }
          : g
      )
    );
  }

  function rueckgabe(inventar: string) {
    setGeraete(
      geraete.map((g) =>
        g.inventar === inventar
          ? { ...g, status: 'Verfügbar', mitarbeiter: '-' }
          : g
      )
    );
  }

  function defekt(inventar: string) {
    setGeraete(
      geraete.map((g) =>
        g.inventar === inventar ? { ...g, status: 'Defekt' } : g
      )
    );
  }

  function statusClass(status: Status) {
    if (status === 'Verfügbar') return 'bg-emerald-100 text-emerald-800';
    if (status === 'Ausgegeben') return 'bg-orange-100 text-orange-800';
    if (status === 'Defekt') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-4xl font-black">Geräteverwaltung</h1>
            <p className="mt-1 text-base font-bold text-slate-700">
              QR-Codes, Ausgabe, Rückgabe, Defektstatus und Prüfungen
            </p>
          </div>

          <a
            href="/"
            className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white"
          >
            Startseite
          </a>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-slate-500">Geräte gesamt</p>
            <p className="text-3xl font-black">{geraete.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-slate-500">Verfügbar</p>
            <p className="text-3xl font-black text-emerald-700">
              {geraete.filter((g) => g.status === 'Verfügbar').length}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-slate-500">Ausgegeben</p>
            <p className="text-3xl font-black text-orange-700">
              {geraete.filter((g) => g.status === 'Ausgegeben').length}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-slate-500">Defekt</p>
            <p className="text-3xl font-black text-red-700">
              {geraete.filter((g) => g.status === 'Defekt').length}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">
              {editing ? 'Gerät bearbeiten' : 'Gerät anlegen'}
            </h2>

            <div className="mt-5 space-y-3">
              {[
                ['Inventarnummer', 'inventar'],
                ['Gerätebezeichnung / Maschine', 'bezeichnung'],
                ['Kategorie', 'kategorie'],
                ['Hersteller', 'hersteller'],
                ['Seriennummer', 'seriennummer'],
                ['Lagerort / Standort', 'lagerort'],
              ].map(([label, key]) => (
                <input
                  key={key}
                  placeholder={label}
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
                />
              ))}

              <input
                type="date"
                value={form.pruefung}
                onChange={(e) => setForm({ ...form, pruefung: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <button
                type="button"
                onClick={saveGeraet}
                className="w-full rounded-xl bg-slate-950 px-4 py-3 font-black text-white"
              >
                {editing ? 'Änderung speichern' : 'Gerät speichern'}
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">Geräteübersicht</h2>
                <p className="text-sm font-bold text-slate-600">
                  QR-Code, Status, Ausgabe und Rückgabe
                </p>
              </div>

              <input
                placeholder="Suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-72 rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
              />
            </div>

            <div className="overflow-auto rounded-2xl border border-slate-200">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-slate-800">
                  <tr>
                    <th className="p-3 font-black">QR</th>
                    <th className="p-3 font-black">Inventar</th>
                    <th className="p-3 font-black">Bezeichnung</th>
                    <th className="p-3 font-black">Standort</th>
                    <th className="p-3 font-black">Status</th>
                    <th className="p-3 font-black">Mitarbeiter</th>
                    <th className="p-3 font-black">Prüfung</th>
                    <th className="p-3 font-black">Aktion</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((g) => {
                    const qrUrl =
                      typeof window !== 'undefined'
                        ? `${window.location.origin}/geraet/${g.inventar}`
                        : g.inventar;

                    return (
                      <tr key={g.inventar} className="border-t border-slate-200">
                        <td className="p-3">
                          <QRCodeCanvas value={qrUrl} size={58} />
                        </td>
                        <td className="p-3 font-black">{g.inventar}</td>
                        <td className="p-3 font-black">{g.bezeichnung}</td>
                        <td className="p-3 font-bold">{g.lagerort}</td>
                        <td className="p-3">
                          <span
                            className={`rounded-lg px-3 py-2 text-xs font-black ${statusClass(
                              g.status
                            )}`}
                          >
                            {g.status}
                          </span>
                        </td>
                        <td className="p-3 font-bold">{g.mitarbeiter}</td>
                        <td className="p-3 font-bold">{g.pruefung || '-'}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => editGeraet(g)}
                              className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-black text-white"
                            >
                              Bearbeiten
                            </button>

                            <button
                              type="button"
                              onClick={() => ausgeben(g.inventar)}
                              className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-black text-white"
                            >
                              Ausgabe
                            </button>

                            <button
                              type="button"
                              onClick={() => rueckgabe(g.inventar)}
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white"
                            >
                              Rückgabe
                            </button>

                            <button
                              type="button"
                              onClick={() => defekt(g.inventar)}
                              className="rounded-lg bg-red-700 px-3 py-2 text-xs font-black text-white"
                            >
                              Defekt
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}