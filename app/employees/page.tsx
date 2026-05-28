'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

type Employee = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  personnel_number: string | null;
  has_driver_license: boolean | null;
  driver_license_classes: string | null;
  archived: boolean | null;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    personnel_number: '',
    has_driver_license: false,
    driver_license_classes: '',
  });

  const inputClass =
    'w-full rounded-2xl border border-slate-300 px-4 py-3 text-base font-bold text-slate-900';

  async function loadEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('archived', false)
      .order('name');

    if (error) {
      setError(error.message);
      return;
    }

    setEmployees(data || []);
  }

  async function saveEmployee(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const { error } = await supabase.from('employees').insert({
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      role: form.role.trim() || null,
      personnel_number: form.personnel_number.trim() || null,
      has_driver_license: form.has_driver_license,
      driver_license_classes: form.driver_license_classes.trim() || null,
      archived: false,
    });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setForm({
      name: '',
      email: '',
      phone: '',
      role: '',
      personnel_number: '',
      has_driver_license: false,
      driver_license_classes: '',
    });

    await loadEmployees();
  }

  async function archiveEmployee(id: string) {
    const confirmed = window.confirm('Mitarbeiter wirklich archivieren?');
    if (!confirmed) return;

    const { error } = await supabase
      .from('employees')
      .update({ archived: true })
      .eq('id', id);

    if (error) {
      alert('Fehler beim Archivieren: ' + error.message);
      return;
    }

    await loadEmployees();
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900">
              Mitarbeiterverwaltung
            </h1>
            <p className="mt-2 text-lg font-bold text-slate-700">
              Mitarbeiter anlegen, Führerschein erfassen und archivieren
            </p>
          </div>

          <a
            href="/"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700"
          >
            Zurück
          </a>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 font-bold text-red-700">
            Fehler: {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form onSubmit={saveEmployee} className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
              Mitarbeiter anlegen
            </h2>

            <div className="space-y-4">
              <input placeholder="Personalnummer" value={form.personnel_number} onChange={(e) => setForm({ ...form, personnel_number: e.target.value })} className={inputClass} />
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
              <input placeholder="E-Mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
              <input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
              <input placeholder="Rolle" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass} />

              <label className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-bold text-slate-900">
                <input
                  type="checkbox"
                  checked={form.has_driver_license}
                  onChange={(e) =>
                    setForm({ ...form, has_driver_license: e.target.checked })
                  }
                />
                Führerschein vorhanden
              </label>

              <input
                placeholder="Führerscheinklassen, z. B. B, BE, C1"
                value={form.driver_license_classes}
                onChange={(e) =>
                  setForm({ ...form, driver_license_classes: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3 text-base font-extrabold text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {saving ? 'Speichert...' : 'Mitarbeiter speichern'}
            </button>
          </form>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
              Aktive Mitarbeiter
            </h2>

            {employees.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-base font-bold text-slate-600">
                Keine aktiven Mitarbeiter vorhanden
              </div>
            ) : (
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      {employee.name}
                    </h3>

                    <div className="mt-3 space-y-2 text-base font-bold text-slate-700">
                      <p>Personalnummer: {employee.personnel_number || '-'}</p>
                      <p>Rolle: {employee.role || '-'}</p>
                      <p>E-Mail: {employee.email || '-'}</p>
                      <p>Telefon: {employee.phone || '-'}</p>
                      <p>Führerschein: {employee.has_driver_license ? 'Ja' : 'Nein'}</p>
                      <p>Klassen: {employee.driver_license_classes || '-'}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => archiveEmployee(employee.id)}
                      className="mt-4 rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700"
                    >
                      Mitarbeiter archivieren
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}