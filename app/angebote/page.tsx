'use client';

import { useMemo, useState } from 'react';

type Position = {
  id: number;
  text: string;
  menge: number;
  einheit: string;
  epNetto: number;
};

type Dokument = {
  id: number;
  typ: 'Angebot' | 'Rechnung';
  nummer: string;
  kunde: string;
  anschrift: string;
  bauvorhaben: string;
  datum: string;
  zahlungsziel: string;
  einleitung: string;
  schluss: string;
  positionen: Position[];
};

export default function AngebotePage() {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dokumente, setDokumente] = useState<Dokument[]>([]);

  const [form, setForm] = useState<Dokument>({
    id: 0,
    typ: 'Angebot',
    nummer: '',
    kunde: '',
    anschrift: '',
    bauvorhaben: '',
    datum: new Date().toISOString().slice(0, 10),
    zahlungsziel: 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
    einleitung: 'Sehr geehrte Damen und Herren, hiermit bieten wir Ihnen folgende Leistungen an:',
    schluss: 'Wir freuen uns auf Ihre Beauftragung.',
    positionen: [
      { id: 1, text: '', menge: 1, einheit: 'Stk', epNetto: 0 },
    ],
  });

  const filtered = useMemo(() => {
    return dokumente.filter((d) =>
      `${d.typ} ${d.nummer} ${d.kunde} ${d.bauvorhaben}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [dokumente, search]);

  function netto(d: Dokument) {
    return d.positionen.reduce((sum, p) => sum + p.menge * p.epNetto, 0);
  }

  function mwst(d: Dokument) {
    return netto(d) * 0.19;
  }

  function brutto(d: Dokument) {
    return netto(d) + mwst(d);
  }

  function updatePosition(id: number, key: keyof Position, value: string) {
    setForm({
      ...form,
      positionen: form.positionen.map((p) =>
        p.id === id
          ? {
              ...p,
              [key]: key === 'menge' || key === 'epNetto' ? Number(value) : value,
            }
          : p
      ),
    });
  }

  function addPosition() {
    setForm({
      ...form,
      positionen: [
        ...form.positionen,
        {
          id: Date.now(),
          text: '',
          menge: 1,
          einheit: 'Stk',
          epNetto: 0,
        },
      ],
    });
  }

  function removePosition(id: number) {
    setForm({
      ...form,
      positionen: form.positionen.filter((p) => p.id !== id),
    });
  }

  function saveDokument() {
    if (!form.kunde || form.positionen.length === 0) {
      alert('Bitte Kunde und mindestens eine Position eintragen.');
      return;
    }

    const nummer =
      form.nummer ||
      `${form.typ === 'Angebot' ? 'ANG' : 'RE'}-${String(dokumente.length + 1).padStart(4, '0')}`;

    const dokument: Dokument = {
      ...form,
      id: editingId || Date.now(),
      nummer,
    };

    if (editingId) {
      setDokumente(dokumente.map((d) => (d.id === editingId ? dokument : d)));
    } else {
      setDokumente([dokument, ...dokumente]);
    }

    resetForm();
  }

  function editDokument(d: Dokument) {
    setEditingId(d.id);
    setForm(d);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function convertToInvoice(d: Dokument) {
    const rechnung: Dokument = {
      ...d,
      id: Date.now(),
      typ: 'Rechnung',
      nummer: `RE-${String(dokumente.length + 1).padStart(4, '0')}`,
      datum: new Date().toISOString().slice(0, 10),
      einleitung: 'Gemäß Beauftragung berechnen wir Ihnen folgende Leistungen:',
      schluss: 'Vielen Dank für Ihren Auftrag.',
    };

    setDokumente([rechnung, ...dokumente]);
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      id: 0,
      typ: 'Angebot',
      nummer: '',
      kunde: '',
      anschrift: '',
      bauvorhaben: '',
      datum: new Date().toISOString().slice(0, 10),
      zahlungsziel: 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
      einleitung: 'Sehr geehrte Damen und Herren, hiermit bieten wir Ihnen folgende Leistungen an:',
      schluss: 'Wir freuen uns auf Ihre Beauftragung.',
      positionen: [
        { id: 1, text: '', menge: 1, einheit: 'Stk', epNetto: 0 },
      ],
    });
  }

  function printDokument(d: Dokument) {
    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>${d.typ} ${d.nummer}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
            .kopf { border-bottom: 3px solid #111; padding-bottom: 18px; margin-bottom: 35px; }
            .firma { font-size: 28px; font-weight: bold; }
            .klein { font-size: 13px; color: #444; }
            h1 { font-size: 34px; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 25px; }
            th, td { border: 1px solid #333; padding: 10px; vertical-align: top; }
            th { background: #eee; }
            .right { text-align: right; }
            .summe { margin-top: 30px; width: 340px; margin-left: auto; }
            .summe p { display: flex; justify-content: space-between; font-size: 17px; margin: 8px 0; }
            .gross { font-size: 23px; font-weight: bold; border-top: 2px solid #111; padding-top: 8px; }
            .textblock { margin-top: 24px; line-height: 1.45; }
          </style>
        </head>
        <body>
          <div class="kopf">
            <div class="firma">BauWerkzeug QR / Musterfirma Bau</div>
            <div class="klein">Musterstraße 1 · 24100 Kiel · Tel. 0431 / 000000 · info@musterfirma.de</div>
            <div class="klein">USt-IdNr.: DE000000000 · IBAN: DE00 0000 0000 0000 0000 00</div>
          </div>

          <p><b>${d.kunde}</b><br>${d.anschrift.replace(/\n/g, '<br>')}</p>

          <h1>${d.typ} ${d.nummer}</h1>
          <p><b>Datum:</b> ${d.datum}</p>
          <p><b>Bauvorhaben:</b> ${d.bauvorhaben}</p>

          <div class="textblock">${d.einleitung}</div>

          <table>
            <thead>
              <tr>
                <th>Pos.</th>
                <th>Leistung</th>
                <th>Menge</th>
                <th>Einheit</th>
                <th>EP Netto</th>
                <th>GP Netto</th>
              </tr>
            </thead>
            <tbody>
              ${d.positionen
                .map(
                  (p, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${p.text.replace(/\n/g, '<br>')}</td>
                      <td class="right">${p.menge}</td>
                      <td>${p.einheit}</td>
                      <td class="right">${p.epNetto.toFixed(2)} €</td>
                      <td class="right">${(p.menge * p.epNetto).toFixed(2)} €</td>
                    </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>

          <div class="summe">
            <p><span>Netto:</span><span>${netto(d).toFixed(2)} €</span></p>
            <p><span>MwSt. 19 %:</span><span>${mwst(d).toFixed(2)} €</span></p>
            <p class="gross"><span>Brutto:</span><span>${brutto(d).toFixed(2)} €</span></p>
          </div>

          <div class="textblock">${d.schluss}</div>
          <p><b>${d.zahlungsziel}</b></p>

          <script>window.print();</script>
        </body>
      </html>
    `);

    win.document.close();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
       <header className="rounded-3xl bg-violet-600 p-6 text-white shadow-sm">
          <div>
            <h1 className="text-4xl font-black">Angebote & Rechnungen</h1>
            <p className="mt-1 font-bold text-slate-700">
              Mehrzeilige Angebote, Briefkopf, Bearbeiten und Rechnungen
            </p>
          </div>

          <a href="/" className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white">
            Startseite
          </a>
        </header>

        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">
              {editingId ? 'Dokument bearbeiten' : 'Dokument erstellen'}
            </h2>

            <div className="mt-5 space-y-3">
              <select
                value={form.typ}
                onChange={(e) => setForm({ ...form, typ: e.target.value as 'Angebot' | 'Rechnung' })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              >
                <option>Angebot</option>
                <option>Rechnung</option>
              </select>

              <input placeholder="Nummer automatisch oder manuell" value={form.nummer} onChange={(e) => setForm({ ...form, nummer: e.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold" />
              <input placeholder="Kunde" value={form.kunde} onChange={(e) => setForm({ ...form, kunde: e.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold" />
              <textarea placeholder="Kundenanschrift" value={form.anschrift} onChange={(e) => setForm({ ...form, anschrift: e.target.value })} className="h-20 w-full rounded-xl border border-slate-300 px-4 py-3 font-bold" />
              <input placeholder="Bauvorhaben" value={form.bauvorhaben} onChange={(e) => setForm({ ...form, bauvorhaben: e.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold" />
              <input type="date" value={form.datum} onChange={(e) => setForm({ ...form, datum: e.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold" />

              <textarea placeholder="Einleitungstext" value={form.einleitung} onChange={(e) => setForm({ ...form, einleitung: e.target.value })} className="h-20 w-full rounded-xl border border-slate-300 px-4 py-3 font-bold" />
              <textarea placeholder="Schlusstext" value={form.schluss} onChange={(e) => setForm({ ...form, schluss: e.target.value })} className="h-20 w-full rounded-xl border border-slate-300 px-4 py-3 font-bold" />
              <input placeholder="Zahlungsziel" value={form.zahlungsziel} onChange={(e) => setForm({ ...form, zahlungsziel: e.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold" />

              <button onClick={saveDokument} className="w-full rounded-xl bg-slate-950 px-4 py-3 font-black text-white">
                {editingId ? 'Änderung speichern' : 'Dokument speichern'}
              </button>

              {editingId && (
                <button onClick={resetForm} className="w-full rounded-xl bg-slate-200 px-4 py-3 font-black">
                  Abbrechen
                </button>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black">Positionen</h2>
              <button onClick={addPosition} className="rounded-xl bg-slate-950 px-4 py-3 font-black text-white">
                Position hinzufügen
              </button>
            </div>

            <div className="space-y-4">
              {form.positionen.map((p, index) => (
                <div key={p.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-black">Position {index + 1}</h3>
                    {form.positionen.length > 1 && (
                      <button onClick={() => removePosition(p.id)} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-black text-white">
                        Entfernen
                      </button>
                    )}
                  </div>

                  <textarea
                    placeholder="Leistungstext"
                    value={p.text}
                    onChange={(e) => updatePosition(p.id, 'text', e.target.value)}
                    className="mb-3 h-24 w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
                  />

                  <div className="grid gap-3 md:grid-cols-4">
                    <input placeholder="Menge" value={p.menge} onChange={(e) => updatePosition(p.id, 'menge', e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 font-bold" />
                    <input placeholder="Einheit" value={p.einheit} onChange={(e) => updatePosition(p.id, 'einheit', e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 font-bold" />
                    <input placeholder="EP Netto" value={p.epNetto} onChange={(e) => updatePosition(p.id, 'epNetto', e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 font-bold" />
                    <div className="rounded-xl bg-white p-3 text-right font-black">
                      {(p.menge * p.epNetto).toFixed(2)} €
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-slate-100 p-5 text-right">
              <p className="font-black">Netto: {netto(form).toFixed(2)} €</p>
              <p className="font-black">MwSt. 19 %: {mwst(form).toFixed(2)} €</p>
              <p className="text-2xl font-black">Brutto: {brutto(form).toFixed(2)} €</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black">Dokumente</h2>
            <input
              placeholder="Suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 rounded-xl border border-slate-300 px-4 py-3 font-bold"
            />
          </div>

          <div className="overflow-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 font-black">Typ</th>
                  <th className="p-3 font-black">Nr.</th>
                  <th className="p-3 font-black">Kunde</th>
                  <th className="p-3 font-black">Bauvorhaben</th>
                  <th className="p-3 text-right font-black">Netto</th>
                  <th className="p-3 text-right font-black">Brutto</th>
                  <th className="p-3 font-black">Aktion</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-t border-slate-200">
                    <td className="p-3 font-black">{d.typ}</td>
                    <td className="p-3 font-black">{d.nummer}</td>
                    <td className="p-3 font-bold">{d.kunde}</td>
                    <td className="p-3 font-bold">{d.bauvorhaben}</td>
                    <td className="p-3 text-right font-black text-blue-700">{netto(d).toFixed(2)} €</td>
                    <td className="p-3 text-right font-black text-emerald-700">{brutto(d).toFixed(2)} €</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => editDokument(d)} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-black text-white">
                          Bearbeiten
                        </button>
                        <button onClick={() => printDokument(d)} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white">
                          Drucken
                        </button>
                        {d.typ === 'Angebot' && (
                          <button onClick={() => convertToInvoice(d)} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-black text-white">
                            Zur Rechnung
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}