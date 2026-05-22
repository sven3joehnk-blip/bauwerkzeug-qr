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
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-4xl font-bold text-slate-900">
          Mitarbeiterverwaltung
        </h1>

        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          <form
            onSubmit={saveEmployee}
            className="rounded-3xl bg-white p-6 shadow-sm"
          >
            <h2 className="mb-4 text-2xl font-semibold">
              Mitarbeiter anlegen
            </h2>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
                required
              />

              <input
                type="email"
                placeholder="E-Mail"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
              />

              <input
                type="text"
                placeholder="Telefon"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
              />

              <input
                type="text"
                placeholder="Rolle"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white"
            >
              Mitarbeiter speichern
            </button>
          </form>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold">
              Mitarbeiterübersicht
            </h2>

            <div className="space-y-4">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <h3 className="text-xl font-bold text-slate-900">
                    {employee.name}
                  </h3>

                  <div className="mt-2 space-y-1 text-sm text-slate-700">
                    {employee.role && (
                      <p>
                        <strong>Rolle:</strong> {employee.role}
                      </p>
                    )}

                    {employee.email && (
                      <p>
                        <strong>E-Mail:</strong> {employee.email}
                      </p>
                    )}

                    {employee.phone && (
                      <p>
                        <strong>Telefon:</strong> {employee.phone}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}