'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const licenseOptions = [
  'AM',
  'A1',
  'A2',
  'A',
  'B',
  'BE',
  'C1',
  'C1E',
  'C',
  'CE',
  'D1',
  'D1E',
  'D',
  'DE',
  'L',
  'T',
];

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
  construction_site_number: string | null;
  activity: string | null;
  start_time: string | null;
  end_time: string | null;
  breakfast_break_minutes: number | null;
  lunch_break_minutes: number | null;
  other_break_minutes: number | null;
  break_minutes: number | null;
  hours: number | null;
  overtime_hours: number | null;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [workTimes, setWorkTimes] = useState<WorkTime[]>([]);
  const [error, setError] = useState('');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);

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
    construction_site_number: '',
    activity: '',
    start_time: '',
    end_time: '',
    breakfast_break_minutes: '0',
    lunch_break_minutes: '30',
    other_break_minutes: '0',
  });

  const inputClass =
    'w-full rounded-2xl border-2 border-slate-300 bg-white px-5 py-4 text-lg font-bold text-slate-950 placeholder:text-slate-500 shadow-sm focus:border-blue-700 focus:outline-none';

  async function loadData() {
    setError('');

    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('archived', false)
      .order('name');

    if (employeeError) {
      setError(employeeError.message);
      return;
    }

    const { data: timeData, error: timeError } = await supabase
      .from('work_times')
      .select('*')
      .order('work_date', { ascending: false });

    if (timeError) {
      setError(timeError.message);
      return;
    }

    setEmployees(employeeData || []);
    setWorkTimes(timeData || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetEmployeeForm() {
    setEditingEmployeeId(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      role: '',
      personnel_number: '',
      has_driver_license: false,
      driver_license_classes: [],
    });
  }

  function toggleLicense(value: string) {
    const exists = form.driver_license_classes.includes(value);
    const next = exists
      ? form.driver_license_classes.filter((item) => item !== value)
      : [...form.driver_license_classes, value];

    setForm({
      ...form,
      driver_license_classes: next,
      has_driver_license: next.length > 0,
    });
  }

  async function saveEmployee(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      role: form.role.trim() || null,
      personnel_number: form.personnel_number.trim() || null,
      has_driver_license: form.driver_license_classes.length > 0,
      driver_license_classes: form.driver_license_classes.join(', '),
      archived: false,
    };

    if (editingEmployeeId) {
      const { error } = await supabase
        .from('employees')
        .update(payload)
        .eq('id', editingEmployeeId);

      if (error) {
        setError(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from('employees').insert(payload);

      if (error) {
        setError(error.message);
        return;
      }
    }

    resetEmployeeForm();
    await loadData();
  }

  function startEditEmployee(employee: Employee) {
    setEditingEmployeeId(employee.id);

    setForm({
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      role: employee.role || '',
      personnel_number: employee.personnel_number || '',
      has_driver_license: !!employee.has_driver_license,
      driver_license_classes: employee.driver_license_classes
        ? employee.driver_license_classes.split(',').map((item) => item.trim())
        : [],
    });
  }

  async function archiveEmployee(id: string) {
    const confirmed = window.confirm('Mitarbeiter wirklich archivieren?');
    if (!confirmed) return;

    const { error } = await supabase
      .from('employees')
      .update({ archived: true })
      .eq('id', id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadData();
  }

  function getBreakTotal() {
    return (
      Number(timeForm.breakfast_break_minutes || 0) +
      Number(timeForm.lunch_break_minutes || 0) +
      Number(timeForm.other_break_minutes || 0)
    );
  }

  function calculateHours() {
    if (!timeForm.start_time || !timeForm.end_time) {
      return { hours: 0, overtime: 0 };
    }

    const start = new Date(`2000-01-01T${timeForm.start_time}`);
    const end = new Date(`2000-01-01T${timeForm.end_time}`);
    const pause = getBreakTotal();

    const grossHours = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
    const netHours = Math.max(0, grossHours - pause / 60);
    const overtime = Math.max(0, netHours - 8);

    return {
      hours: Number(netHours.toFixed(2)),
      overtime: Number(overtime.toFixed(2)),
    };
  }

  async function saveWorkTime(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const result = calculateHours();
    const totalBreak = getBreakTotal();

    const { error } = await supabase.from('work_times').insert({
      employee_id: timeForm.employee_id,
      work_date: timeForm.work_date,
      construction_site_number: timeForm.construction_site_number.trim() || null,
      activity: timeForm.activity.trim() || null,
      start_time: timeForm.start_time,
      end_time: timeForm.end_time,
      breakfast_break_minutes: Number(timeForm.breakfast_break_minutes || 0),
      lunch_break_minutes: Number(timeForm.lunch_break_minutes || 0),
      other_break_minutes: Number(timeForm.other_break_minutes || 0),
      break_minutes: totalBreak,
      hours: result.hours,
      overtime_hours: result.overtime,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setTimeForm({
      employee_id: '',
      work_date: '',
      construction_site_number: '',
      activity: '',
      start_time: '',
      end_time: '',
      breakfast_break_minutes: '0',
      lunch_break_minutes: '30',
      other_break_minutes: '0',
    });

    await loadData();
  }

  function getEmployeeName(id: string) {
    return employees.find((employee) => employee.id === id)?.name || 'Unbekannt';
  }

  function getEmployeeSummary(employeeId: string) {
    const rows = workTimes.filter((row) => row.employee_id === employeeId);

    const hours = rows.reduce((sum, row) => sum + Number(row.hours || 0), 0);
    const overtime = rows.reduce((sum, row) => sum + Number(row.overtime_hours || 0), 0);

    return {
      hours: hours.toFixed(2),
      overtime: overtime.toFixed(2),
    };
  }

  const previewHours = calculateHours();
  const previewBreak = getBreakTotal();

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-slate-950">
              Mitarbeiterverwaltung
            </h1>
            <p className="mt-3 text-xl font-bold text-slate-800">
              Personal, Führerscheine, Archivierung und Arbeitszeiten
            </p>
          </div>

          <a
            href="/"
            className="rounded-2xl bg-slate-950 px-6 py-4 text-lg font-black text-white hover:bg-slate-800"
          >
            Zurück zur Geräteübersicht
          </a>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border-2 border-red-400 bg-red-50 p-5 text-lg font-black text-red-800">
            Fehler: {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <div className="space-y-8">
            <form onSubmit={saveEmployee} className="rounded-3xl bg-white p-7 shadow">
              <h2 className="mb-6 text-3xl font-black text-slate-950">
                {editingEmployeeId ? 'Mitarbeiter bearbeiten' : 'Mitarbeiter anlegen'}
              </h2>

              <div className="space-y-4">
                <input className={inputClass} placeholder="Personalnummer z. B. 1001" value={form.personnel_number} onChange={(e) => setForm({ ...form, personnel_number: e.target.value })} />
                <input className={inputClass} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input className={inputClass} placeholder="E-Mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className={inputClass} placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input className={inputClass} placeholder="Rolle / Position" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />

                <div className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-5">
                  <p className="mb-4 text-xl font-black text-slate-950">
                    Führerscheinklassen
                  </p>

                  <div className="grid grid-cols-4 gap-3">
                    {licenseOptions.map((license) => (
                      <label key={license} className="flex items-center gap-2 rounded-xl bg-white p-3 text-lg font-black text-slate-950 shadow-sm">
                        <input
                          type="checkbox"
                          checked={form.driver_license_classes.includes(license)}
                          onChange={() => toggleLicense(license)}
                          className="h-5 w-5"
                        />
                        {license}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button className="mt-6 w-full rounded-2xl bg-slate-950 px-6 py-4 text-xl font-black text-white hover:bg-slate-800">
                {editingEmployeeId ? 'Mitarbeiter aktualisieren' : 'Mitarbeiter speichern'}
              </button>

              {editingEmployeeId && (
                <button
                  type="button"
                  onClick={resetEmployeeForm}
                  className="mt-3 w-full rounded-2xl bg-slate-300 px-6 py-4 text-xl font-black text-slate-950 hover:bg-slate-400"
                >
                  Bearbeiten abbrechen
                </button>
              )}
            </form>

            <form onSubmit={saveWorkTime} className="rounded-3xl bg-white p-7 shadow">
              <h2 className="mb-6 text-3xl font-black text-slate-950">
                Arbeitszeit erfassen
              </h2>

              <div className="space-y-4">
                <select className={inputClass} value={timeForm.employee_id} onChange={(e) => setTimeForm({ ...timeForm, employee_id: e.target.value })} required>
                  <option value="">Mitarbeiter auswählen</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>

                <input className={inputClass} type="date" value={timeForm.work_date} onChange={(e) => setTimeForm({ ...timeForm, work_date: e.target.value })} required />
                <input className={inputClass} placeholder="Baustellennummer z. B. BAU-2026-001" value={timeForm.construction_site_number} onChange={(e) => setTimeForm({ ...timeForm, construction_site_number: e.target.value })} required />
                <input className={inputClass} placeholder="Tätigkeit / Beschreibung" value={timeForm.activity} onChange={(e) => setTimeForm({ ...timeForm, activity: e.target.value })} />

                <div className="grid grid-cols-2 gap-4">
                  <input className={inputClass} type="time" value={timeForm.start_time} onChange={(e) => setTimeForm({ ...timeForm, start_time: e.target.value })} required />
                  <input className={inputClass} type="time" value={timeForm.end_time} onChange={(e) => setTimeForm({ ...timeForm, end_time: e.target.value })} required />
                </div>

                <div className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-5">
                  <p className="mb-4 text-xl font-black text-slate-950">
                    Pausenzeiten nach Arbeitszeitnachweis
                  </p>

                  <div className="grid grid-cols-3 gap-4">
                    <input className={inputClass} type="number" placeholder="Frühstück Min." value={timeForm.breakfast_break_minutes} onChange={(e) => setTimeForm({ ...timeForm, breakfast_break_minutes: e.target.value })} />
                    <input className={inputClass} type="number" placeholder="Mittag Min." value={timeForm.lunch_break_minutes} onChange={(e) => setTimeForm({ ...timeForm, lunch_break_minutes: e.target.value })} />
                    <input className={inputClass} type="number" placeholder="Sonstiges Min." value={timeForm.other_break_minutes} onChange={(e) => setTimeForm({ ...timeForm, other_break_minutes: e.target.value })} />
                  </div>

                  <p className="mt-4 text-lg font-black text-slate-900">
                    Pause gesamt: {previewBreak} Minuten
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-blue-50 p-5 text-center">
                    <p className="text-lg font-black text-slate-800">Arbeitszeit netto</p>
                    <p className="text-3xl font-black text-blue-800">{previewHours.hours.toFixed(2)} h</p>
                  </div>

                  <div className="rounded-2xl bg-red-50 p-5 text-center">
                    <p className="text-lg font-black text-slate-800">Überstunden</p>
                    <p className="text-3xl font-black text-red-700">{previewHours.overtime.toFixed(2)} h</p>
                  </div>
                </div>
              </div>

              <button className="mt-6 w-full rounded-2xl bg-blue-700 px-6 py-4 text-xl font-black text-white hover:bg-blue-800">
                Arbeitszeit speichern
              </button>
            </form>
          </div>

          <section className="rounded-3xl bg-white p-7 shadow">
            <h2 className="mb-6 text-3xl font-black text-slate-950">
              Aktive Mitarbeiter
            </h2>

            <div className="grid gap-5 xl:grid-cols-2">
              {employees.map((employee) => {
                const summary = getEmployeeSummary(employee.id);

                return (
                  <div key={employee.id} className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-6">
                    <h3 className="text-3xl font-black text-slate-950">
                      {employee.name}
                    </h3>

                    <div className="mt-4 space-y-2 text-lg font-bold text-slate-900">
                      <p>Personalnummer: {employee.personnel_number || '-'}</p>
                      <p>Rolle: {employee.role || '-'}</p>
                      <p>E-Mail: {employee.email || '-'}</p>
                      <p>Telefon: {employee.phone || '-'}</p>
                      <p>Führerschein: {employee.has_driver_license ? 'Ja' : 'Nein'}</p>
                      <p>Klassen: {employee.driver_license_classes || '-'}</p>
                      <p>Stunden gesamt: {summary.hours}</p>
                      <p>Überstunden gesamt: {summary.overtime}</p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => startEditEmployee(employee)}
                        className="rounded-2xl bg-blue-700 px-5 py-3 text-lg font-black text-white hover:bg-blue-800"
                      >
                        Bearbeiten
                      </button>

                      <button
                        type="button"
                        onClick={() => archiveEmployee(employee.id)}
                        className="rounded-2xl bg-yellow-600 px-5 py-3 text-lg font-black text-white hover:bg-yellow-700"
                      >
                        Archivieren
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <h2 className="mb-6 mt-10 text-3xl font-black text-slate-950">
              Arbeitszeitnachweise
            </h2>

            <div className="space-y-4">
              {workTimes.map((entry) => (
                <div key={entry.id} className="rounded-2xl border-2 border-slate-200 bg-white p-5 text-lg font-bold text-slate-900">
                  <p>Datum: {entry.work_date}</p>
                  <p>Mitarbeiter: {getEmployeeName(entry.employee_id)}</p>
                  <p>Baustelle: {entry.construction_site_number || '-'}</p>
                  <p>Tätigkeit: {entry.activity || '-'}</p>
                  <p>Arbeitszeit: {entry.start_time} bis {entry.end_time}</p>
                  <p>Frühstückspause: {entry.breakfast_break_minutes || 0} Minuten</p>
                  <p>Mittagspause: {entry.lunch_break_minutes || 0} Minuten</p>
                  <p>Sonstige Pause: {entry.other_break_minutes || 0} Minuten</p>
                  <p>Pause gesamt: {entry.break_minutes || 0} Minuten</p>
                  <p>Stunden: {Number(entry.hours || 0).toFixed(2)}</p>
                  <p>Überstunden: {Number(entry.overtime_hours || 0).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}