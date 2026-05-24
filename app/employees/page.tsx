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
  active: boolean;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
  });

  const inputClass =
    'rounded-2xl border border-slate-300 px-4 py-3 text-base font-semibold text-slate-900 placeholder:text-slate-500';

  async function loadEmployees() {
    const { data } = await supabase
      .from('employees')
      .select('*')
      .order('name');

    setEmployees(data || []);
  }

  async function saveEmployee(e: React.FormEvent) {
    e.preventDefault();

    await supabase.from('employees').insert({
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      role: form.role || null,
      active: true,
    });

    setForm({
      name: '',
      email: '',
      phone: '',
      role: '',
    });

    loadEmployees();
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-950">
              Mitarbeiterverwaltung
            </h1>
            <p className="mt-2 text-lg font-semibold text-slate-700">
              Mitarbeiter anlegen und später Geräte zuweisen.
            </p>
          </div>

          <a
            href="/"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-center text-base font-bold text-white hover:bg-slate-700"
          >
            Zurück zur Geräteübersicht
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form
            onSubmit={saveEmployee}
            className="rounded-3xl bg-white p-6 shadow-sm"
          >
            <h2 className="mb-5 text-2xl font-extrabold text-slate-950">
              Mitarbeiter anlegen
            </h2>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                required
              />

              <input
                type="email"
                placeholder="E-Mail"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />

              <input
                type="text"
                placeholder="Telefon"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass}
              />

              <input
                type="text"
                placeholder="Rolle z. B. Bauleiter, Monteur, Lager"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-2xl bg-slate-900 px-6 py-3 text-base font-extrabold text-white hover:bg-slate-700"
            >
              Mitarbeiter speichern
            </button>
          </form>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-extrabold text-slate-950">
              Mitarbeiterübersicht
            </h2>

            {employees.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-base font-bold text-slate-600">
                Noch keine Mitarbeiter vorhanden.
              </div>
            ) : (
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
                  >
                    <h3 className="text-2xl font-extrabold text-slate-950">
                      {employee.name}
                    </h3>

                    <div className="mt-3 space-y-2 text-base font-semibold text-slate-800">
                      {employee.role && (
                        <p>
                          <span className="font-extrabold text-slate-950">
                            Rolle:
                          </span>{' '}
                          {employee.role}
                        </p>
                      )}

                      {employee.email && (
                        <p>
                          <span className="font-extrabold text-slate-950">
                            E-Mail:
                          </span>{' '}
                          {employee.email}
                        </p>
                      )}

                      {employee.phone && (
                        <p>
                          <span className="font-extrabold text-slate-950">
                            Telefon:
                          </span>{' '}
                          {employee.phone}
                        </p>
                      )}

                      <p>
                        <span className="font-extrabold text-slate-950">
                          Status:
                        </span>{' '}
                        {employee.active ? 'Aktiv' : 'Inaktiv'}
                      </p>
                    </div>
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