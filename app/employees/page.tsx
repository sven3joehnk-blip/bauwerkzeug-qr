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

type WorkTime = {
  id: string;
  employee_id: string;
  work_date: string;
  start_time: string | null;
  end_time: string | null;
  break_minutes: number | null;
  hours: number | null;
  overtime_hours: number | null;
  note: string | null;
};

const licenseClasses = ['AM', 'A1', 'A2', 'A', 'B', 'BE', 'C1', 'C1E', 'C', 'CE', 'D1', 'D1E', 'D', 'DE', 'L', 'T'];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [workTimes, setWorkTimes] = useState<WorkTime[]>([]);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    personnel_number: '',
    has_driver_license: false,
    driver_license_classes: [] as string[],
  });

  const [timeForm, setTimeForm] = useState({
    employee_id: '',
    work_date: '',
    start_time: '',
    end_time: '',
    break_minutes: '30',
    note: '',
  });

  const inputClass = 'w-full rounded-2xl border border-slate-300 px-4 py-3 text-base font-bold text-slate-900';

  async function loadData() {
    const { data: emp, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('archived', false)
      .order('name');

    if (empError) {
      setError(empError.message);
      return;
    }

    const { data: times, error: timeError } = await supabase
      .from('work_times')
      .select('*')
      .order('work_date', { ascending: false });

    if (timeError) {
      setError(timeError.message);
      return;
    }

    setEmployees(emp || []);
    setWorkTimes(times || []);
  }

  async function saveEmployee(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const { error } = await supabase.from('employees').insert({
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      role: form.role.trim() || null,
      personnel_number: form.personnel_number.trim() || null,
      has_driver_license: form.has_driver_license,
      driver_license_classes: form.driver_license_classes.join(', '),
      archived: false,
    });

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
      driver_license_classes: [],
    });

    await loadData();
  }

  async function archiveEmployee(id: string) {
    if (!confirm('Mitarbeiter wirklich archivieren?')) return;

    const { error } = await supabase
      .from('employees')
      .update({ archived: true })
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
  }

  function toggleLicense(cls: string) {
    const current = form.driver_license_classes;
    const next = current.includes(cls)
      ? current.filter((x) => x !== cls)
      : [...current, cls];

    setForm({ ...form, driver_license_classes: next, has_driver_license: next.length > 0 });
  }

  function calculateHours() {
    if (!timeForm.start_time || !timeForm.end_time) return { hours: 0, overtime: 0 };

    const start = new Date(`2000-01-01T${timeForm.start_time}`);
    const end = new Date(`2000-01-01T${timeForm.end_time}`);
    const breakMinutes = Number(timeForm.break_minutes || 0);

    const diff = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
    const hours = Math.max(0, diff - breakMinutes / 60);
    const overtime = Math.max(0, hours - 8);

    return {
      hours: Number(hours.toFixed(2)),
      overtime: Number(overtime.toFixed(2)),
    };
  }

  async function saveWorkTime(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const result = calculateHours();

    const { error } = await supabase.from('work_times').insert({
      employee_id: timeForm.employee_id,
      work_date: timeForm.work_date,
      start_time: timeForm.start_time || null,
      end_time: timeForm.end_time || null,
      break_minutes: Number(timeForm.break_minutes || 0),
      hours: result.hours,
      overtime_hours: result.overtime,
      note: timeForm.note || null,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setTimeForm({
      employee_id: '',
      work_date: '',
      start_time: '',
      end_time: '',
      break_minutes: '30',
      note: '',
    });

    await loadData();
  }

  function employeeName(id: string) {
    return employees.find((e) => e.id === id)?.name || 'Unbekannt';
  }

  function monthlySummary(employeeId: string) {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const rows = workTimes.filter((w) => {
      const d = new Date(w.work_date);
      return w.employee_id === employeeId && d.getMonth() === month && d.getFullYear() === year;
    });

    const hours = rows.reduce((sum, row) => sum + Number(row.hours || 0), 0);
    const overtime = rows.reduce((sum, row) => sum + Number(row.overtime_hours || 0), 0);

    return {
      hours: hours.toFixed(2),
      overtime: overtime.toFixed(2),
    };
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900">Mitarbeiterverwaltung</h1>
            <p className="mt-2 text-lg font-bold text-slate-700">
              Personal, Führerscheine, Archiv und Arbeitszeiten
            </p>
          </div>

          <a href="/" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">
            Zurück
          </a>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 font-bold text-red-700">
            Fehler: {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="space-y-6">
            <form onSubmit={saveEmployee} className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-extrabold text-slate-900">Mitarbeiter anlegen</h2>

              <div className="space-y-4">
                <input className={inputClass} placeholder="Personalnummer" value={form.personnel_number} onChange={(e) => setForm({ ...form, personnel_number: e.target.value })} />
                <input className={inputClass} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input className={inputClass} placeholder="E-Mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className={inputClass} placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input className={inputClass} placeholder="Rolle" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />

                <div className="rounded-2xl border border-slate-300 p-4">
                  <p className="mb-3 font-extrabold text-slate-900">Führerscheinklassen</p>
                  <div className="grid grid-cols-4 gap-2">
                    {licenseClasses.map((cls) => (
                      <label key={cls} className="flex items-center gap-2 font-bold">
                        <input
                          type="checkbox"
                          checked={form.driver_license_classes.includes(cls)}
                          onChange={() => toggleLicense(cls)}
                        />
                        {cls}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3 font-extrabold text-white">
                Mitarbeiter speichern
              </button>
            </form>

            <form onSubmit={saveWorkTime} className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-extrabold text-slate-900">Arbeitszeit erfassen</h2>

              <div className="space-y-4">
                <select className={inputClass} value={timeForm.employee_id} onChange={(e) => setTimeForm({ ...timeForm, employee_id: e.target.value })} required>
                  <option value="">Mitarbeiter auswählen</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>

                <input className={inputClass} type="date" value={timeForm.work_date} onChange={(e) => setTimeForm({ ...timeForm, work_date: e.target.value })} required />
                <input className={inputClass} type="time" value={timeForm.start_time} onChange={(e) => setTimeForm({ ...timeForm, start_time: e.target.value })} required />
                <input className={inputClass} type="time" value={timeForm.end_time} onChange={(e) => setTimeForm({ ...timeForm, end_time: e.target.value })} required />
                <input className={inputClass} placeholder="Pause Minuten" value={timeForm.break_minutes} onChange={(e) => setTimeForm({ ...timeForm, break_minutes: e.target.value })} />
                <input className={inputClass} placeholder="Notiz / Baustelle" value={timeForm.note} onChange={(e) => setTimeForm({ ...timeForm, note: e.target.value })} />
              </div>

              <button className="mt-6 w-full rounded-2xl bg-blue-700 px-5 py-3 font-extrabold text-white">
                Arbeitszeit speichern
              </button>
            </form>
          </div>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-extrabold text-slate-900">Aktive Mitarbeiter</h2>

            <div className="space-y-4">
              {employees.map((employee) => {
                const sum = monthlySummary(employee.id);

                return (
                  <div key={employee.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-2xl font-extrabold text-slate-900">{employee.name}</h3>

                    <div className="mt-3 space-y-1 text-base font-bold text-slate-700">
                      <p>Personalnummer: {employee.personnel_number || '-'}</p>
                      <p>Rolle: {employee.role || '-'}</p>
                      <p>E-Mail: {employee.email || '-'}</p>
                      <p>Telefon: {employee.phone || '-'}</p>
                      <p>Führerschein: {employee.has_driver_license ? 'Ja' : 'Nein'}</p>
                      <p>Klassen: {employee.driver_license_classes || '-'}</p>
                      <p>Stunden aktueller Monat: {sum.hours}</p>
                      <p>Überstunden aktueller Monat: {sum.overtime}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => archiveEmployee(employee.id)}
                      className="mt-4 rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white"
                    >
                      Mitarbeiter archivieren
                    </button>
                  </div>
                );
              })}
            </div>

            <h2 className="mb-5 mt-8 text-2xl font-extrabold text-slate-900">Arbeitszeitnachweise</h2>

            <div className="space-y-3">
              {workTimes.map((row) => (
                <div key={row.id} className="rounded-xl border bg-white p-4 font-bold text-slate-700">
                  <p>{row.work_date} — {employeeName(row.employee_id)}</p>
                  <p>{row.start_time} bis {row.end_time}, Pause {row.break_minutes || 0} Min.</p>
                  <p>Stunden: {row.hours || 0} | Überstunden: {row.overtime_hours || 0}</p>
                  <p>Notiz: {row.note || '-'}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}