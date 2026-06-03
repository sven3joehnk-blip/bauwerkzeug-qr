'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const licenseOptions = ['AM', 'A1', 'A2', 'A', 'B', 'BE', 'C1', 'C1E', 'C', 'CE', 'D1', 'D1E', 'D', 'DE', 'L', 'T'];
const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

export default function EmployeesPage() {
  const now = new Date();

  const [employees, setEmployees] = useState<any[]>([]);
  const [workTimes, setWorkTimes] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  const [employeeForm, setEmployeeForm] = useState({
    personnel_number: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    driver_license_classes: [] as string[],
    is_safety_specialist: false,
    first_aid_last_date: '',
    first_aid_next_date: '',
  });

  const [timeForm, setTimeForm] = useState({
    employee_id: '',
    work_date: '',
    construction_site_number: '',
    activity: '',
    start_time: '07:00',
    end_time: '16:00',
    breakfast_break_minutes: '15',
    lunch_break_minutes: '30',
    other_break_minutes: '0',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (!supabase) {
      setError('Supabase Umgebungsvariablen fehlen.');
      return;
    }

    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('archived', false)
      .order('personnel_number');

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

    if (!employeeForm.personnel_number && !editingId) {
      setEmployeeForm((prev) => ({
        ...prev,
        personnel_number: nextPersonnelNumber(employeeData || []),
      }));
    }
  }

  function nextPersonnelNumber(list: any[]) {
    const max = list.reduce((highest, employee) => {
      const nr = Number(employee.personnel_number || 0);
      return nr > highest ? nr : highest;
    }, 0);

    return String(max + 1).padStart(3, '0');
  }

  function toggleLicense(license: string) {
    const exists = employeeForm.driver_license_classes.includes(license);

    setEmployeeForm({
      ...employeeForm,
      driver_license_classes: exists
        ? employeeForm.driver_license_classes.filter((x) => x !== license)
        : [...employeeForm.driver_license_classes, license],
    });
  }

  function resetEmployeeForm() {
    setEditingId(null);
    setEmployeeForm({
      personnel_number: nextPersonnelNumber(employees),
      name: '',
      email: '',
      phone: '',
      role: '',
      driver_license_classes: [],
      is_safety_specialist: false,
      first_aid_last_date: '',
      first_aid_next_date: '',
    });
  }

  function editEmployee(employee: any) {
    setEditingId(employee.id);

    setEmployeeForm({
      personnel_number: employee.personnel_number || '',
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      role: employee.role || '',
      driver_license_classes: employee.driver_license_classes
        ? employee.driver_license_classes.split(',').map((x: string) => x.trim())
        : [],
      is_safety_specialist: !!employee.is_safety_specialist,
      first_aid_last_date: employee.first_aid_last_date || '',
      first_aid_next_date: employee.first_aid_next_date || '',
    });
  }

  async function saveEmployee(e: any) {
    e.preventDefault();
    if (!supabase) return;

    const payload = {
      personnel_number: employeeForm.personnel_number,
      name: employeeForm.name,
      email: employeeForm.email || null,
      phone: employeeForm.phone || null,
      role: employeeForm.role || null,
      has_driver_license: employeeForm.driver_license_classes.length > 0,
      driver_license_classes: employeeForm.driver_license_classes.join(', '),
      is_safety_specialist: employeeForm.is_safety_specialist,
      first_aid_last_date: employeeForm.first_aid_last_date || null,
      first_aid_next_date: employeeForm.first_aid_next_date || null,
      archived: false,
    };

    const result = editingId
      ? await supabase.from('employees').update(payload).eq('id', editingId)
      : await supabase.from('employees').insert(payload);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    resetEmployeeForm();
    await loadData();
  }

  async function archiveEmployee(id: string) {
    if (!supabase) return;
    if (!confirm('Mitarbeiter archivieren?')) return;

    const { error } = await supabase.from('employees').update({ archived: true }).eq('id', id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadData();
  }

  function calculateBreakMinutes() {
    return (
      Number(timeForm.breakfast_break_minutes || 0) +
      Number(timeForm.lunch_break_minutes || 0) +
      Number(timeForm.other_break_minutes || 0)
    );
  }

  function calculateHours() {
    const start = new Date(`2000-01-01T${timeForm.start_time}`);
    const end = new Date(`2000-01-01T${timeForm.end_time}`);
    const gross = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
    const net = Math.max(0, gross - calculateBreakMinutes() / 60);

    return {
      hours: Number(net.toFixed(2)),
      overtime: Number(Math.max(0, net - 8).toFixed(2)),
    };
  }

  async function saveWorkTime(e: any) {
    e.preventDefault();
    if (!supabase) return;

    const calc = calculateHours();

    const { error } = await supabase.from('work_times').insert({
      employee_id: timeForm.employee_id,
      work_date: timeForm.work_date,
      construction_site_number: timeForm.construction_site_number,
      activity: timeForm.activity,
      start_time: timeForm.start_time,
      end_time: timeForm.end_time,
      breakfast_break_minutes: Number(timeForm.breakfast_break_minutes),
      lunch_break_minutes: Number(timeForm.lunch_break_minutes),
      other_break_minutes: Number(timeForm.other_break_minutes),
      break_minutes: calculateBreakMinutes(),
      hours: calc.hours,
      overtime_hours: calc.overtime,
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
      start_time: '07:00',
      end_time: '16:00',
      breakfast_break_minutes: '15',
      lunch_break_minutes: '30',
      other_break_minutes: '0',
    });

    await loadData();
  }

  function isInSelectedMonth(row: any) {
    const date = new Date(row.work_date);
    return date.getMonth() + 1 === Number(selectedMonth) && date.getFullYear() === Number(selectedYear);
  }

  function isInSelectedYear(row: any) {
    const date = new Date(row.work_date);
    return date.getFullYear() === Number(selectedYear);
  }

  function employeeSummary(employeeId: string, mode: 'month' | 'year') {
    const rows = workTimes.filter((row) => {
      const sameEmployee = String(row.employee_id) === String(employeeId);
      return sameEmployee && (mode === 'month' ? isInSelectedMonth(row) : isInSelectedYear(row));
    });

    return {
      hours: rows.reduce((sum, row) => sum + Number(row.hours || 0), 0),
      overtime: rows.reduce((sum, row) => sum + Number(row.overtime_hours || 0), 0),
      entries: rows.length,
    };
  }

  function employeeName(id: string) {
    return employees.find((e) => String(e.id) === String(id))?.name || '-';
  }

  function firstAidStatus(employee: any) {
    if (!employee.first_aid_next_date) return { text: 'fehlt', className: 'bg-slate-100 text-slate-700' };

    const today = new Date();
    const next = new Date(employee.first_aid_next_date);
    const days = Math.ceil((next.getTime() - today.getTime()) / 1000 / 60 / 60 / 24);

    if (days < 0) return { text: 'fällig', className: 'bg-red-100 text-red-800' };
    if (days <= 60) return { text: 'bald fällig', className: 'bg-orange-100 text-orange-800' };
    return { text: 'gültig', className: 'bg-emerald-100 text-emerald-800' };
  }

  const filteredEmployees = employees.filter((employee) =>
    `${employee.personnel_number || ''} ${employee.name || ''} ${employee.role || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const monthRows = workTimes.filter(isInSelectedMonth);
  const yearRows = workTimes.filter(isInSelectedYear);

  const monthTotal = {
    hours: monthRows.reduce((sum, row) => sum + Number(row.hours || 0), 0),
    overtime: monthRows.reduce((sum, row) => sum + Number(row.overtime_hours || 0), 0),
  };

  const yearTotal = {
    hours: yearRows.reduce((sum, row) => sum + Number(row.hours || 0), 0),
    overtime: yearRows.reduce((sum, row) => sum + Number(row.overtime_hours || 0), 0),
  };

  const monthlyYearOverview = months.map((month, index) => {
    const rows = workTimes.filter((row) => {
      const date = new Date(row.work_date);
      return date.getFullYear() === Number(selectedYear) && date.getMonth() === index;
    });

    return {
      month,
      hours: rows.reduce((sum, row) => sum + Number(row.hours || 0), 0),
      overtime: rows.reduce((sum, row) => sum + Number(row.overtime_hours || 0), 0),
      entries: rows.length,
    };
  });

  const preview = calculateHours();

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">

        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black">Mitarbeiterverwaltung</h1>
              <p className="mt-1 text-base font-bold text-slate-700">
                Personal, Arbeitssicherheit, Erste Hilfe, Monats- und Jahresstunden
              </p>
            </div>

            <a href="/" className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white">
              Startseite
            </a>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 font-black text-red-700">
            Fehler: {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-slate-500">Mitarbeiter</p>
            <p className="text-3xl font-black">{employees.length}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-slate-500">Monatsstunden</p>
            <p className="text-3xl font-black text-blue-700">{monthTotal.hours.toFixed(1)}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-slate-500">Monats-ÜStd.</p>
            <p className="text-3xl font-black text-orange-700">{monthTotal.overtime.toFixed(1)}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-slate-500">Jahresstunden</p>
            <p className="text-3xl font-black">{yearTotal.hours.toFixed(1)}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-slate-500">SiFa</p>
            <p className="text-3xl font-black text-emerald-700">
              {employees.filter((e) => e.is_safety_specialist).length}
            </p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 font-bold">
              {months.map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </select>

            <input value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-28 rounded-xl border border-slate-300 px-4 py-3 font-bold" />

            <input placeholder="Mitarbeiter suchen..." value={search} onChange={(e) => setSearch(e.target.value)} className="min-w-72 rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500" />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form onSubmit={saveEmployee} className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">
              {editingId ? 'Mitarbeiter bearbeiten' : 'Mitarbeiter anlegen'}
            </h2>

            <div className="mt-5 space-y-3">
              {[
                ['Personalnummer', 'personnel_number'],
                ['Name', 'name'],
                ['E-Mail', 'email'],
                ['Telefon', 'phone'],
                ['Position', 'role'],
              ].map(([label, key]) => (
                <input
                  key={key}
                  placeholder={label}
                  value={(employeeForm as any)[key]}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, [key]: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
                />
              ))}

              <label className="flex items-center gap-3 rounded-xl border border-slate-300 p-3 font-black">
                <input
                  type="checkbox"
                  checked={employeeForm.is_safety_specialist}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, is_safety_specialist: e.target.checked })}
                />
                Fachkraft für Arbeitssicherheit
              </label>

              <input
                type="date"
                value={employeeForm.first_aid_last_date}
                onChange={(e) => setEmployeeForm({ ...employeeForm, first_aid_last_date: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <input
                type="date"
                value={employeeForm.first_aid_next_date}
                onChange={(e) => setEmployeeForm({ ...employeeForm, first_aid_next_date: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-sm font-black">Führerscheinklassen</p>
                <div className="grid grid-cols-4 gap-2">
                  {licenseOptions.map((license) => (
                    <label key={license} className="flex items-center gap-1 text-sm font-black">
                      <input type="checkbox" checked={employeeForm.driver_license_classes.includes(license)} onChange={() => toggleLicense(license)} />
                      {license}
                    </label>
                  ))}
                </div>
              </div>

              <button className="w-full rounded-xl bg-slate-950 px-4 py-3 font-black text-white">
                {editingId ? 'Aktualisieren' : 'Speichern'}
              </button>

              {editingId && (
                <button type="button" onClick={resetEmployeeForm} className="w-full rounded-xl bg-slate-200 px-4 py-3 font-black">
                  Abbrechen
                </button>
              )}
            </div>
          </form>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-2xl font-black">Mitarbeiterübersicht</h2>

            <div className="overflow-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 font-black">Nr.</th>
                    <th className="p-3 font-black">Name</th>
                    <th className="p-3 font-black">Position</th>
                    <th className="p-3 font-black">SiFa</th>
                    <th className="p-3 font-black">Erste Hilfe</th>
                    <th className="p-3 text-right font-black">Monat</th>
                    <th className="p-3 text-right font-black">Jahr</th>
                    <th className="p-3 font-black">Aktion</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((employee) => {
                    const month = employeeSummary(employee.id, 'month');
                    const year = employeeSummary(employee.id, 'year');
                    const aid = firstAidStatus(employee);

                    return (
                      <tr key={employee.id} className="border-t border-slate-200">
                        <td className="p-3 font-black">{employee.personnel_number}</td>
                        <td className="p-3 font-black">{employee.name}</td>
                        <td className="p-3 font-bold">{employee.role || '-'}</td>
                        <td className="p-3 font-bold">{employee.is_safety_specialist ? 'Ja' : 'Nein'}</td>
                        <td className="p-3 font-bold">
                          <span className={`rounded-lg px-3 py-2 text-xs font-black ${aid.className}`}>
                            {aid.text}
                          </span>
                          <div className="mt-1 text-xs font-bold text-slate-500">
                            {employee.first_aid_last_date || '-'} / {employee.first_aid_next_date || '-'}
                          </div>
                        </td>
                        <td className="p-3 text-right font-black text-blue-700">{month.hours.toFixed(1)}</td>
                        <td className="p-3 text-right font-black">{year.hours.toFixed(1)}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button type="button" onClick={() => editEmployee(employee)} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-black text-white">
                              Bearbeiten
                            </button>
                            <button type="button" onClick={() => archiveEmployee(employee.id)} className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-black text-white">
                              Archiv
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