'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const licenseOptions = ['AM', 'A1', 'A2', 'A', 'B', 'BE', 'C1', 'C1E', 'C', 'CE', 'D1', 'D1E', 'D', 'DE', 'L', 'T'];

type Employee = {
  id: string;
  personnel_number: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
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

const emptyEmployeeForm = {
  personnel_number: '',
  name: '',
  email: '',
  phone: '',
  role: '',
  driver_license_classes: [] as string[],
};

const emptyTimeForm = {
  employee_id: '',
  work_date: '',
  construction_site_number: '',
  activity: '',
  start_time: '07:00',
  end_time: '16:00',
  breakfast_break_minutes: '15',
  lunch_break_minutes: '30',
  other_break_minutes: '0',
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [workTimes, setWorkTimes] = useState<WorkTime[]>([]);
  const [employeeForm, setEmployeeForm] = useState(emptyEmployeeForm);
  const [timeForm, setTimeForm] = useState(emptyTimeForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none focus:border-slate-900';
  const labelClass = 'mb-2 block text-sm font-black text-slate-800';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setError('');
    if (!supabase) {
      setError('Supabase Umgebungsvariablen fehlen.');
      return;
    }

    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('archived', false)
      .order('personnel_number', { ascending: true });

    if (employeeError) {
      setError(employeeError.message);
      return;
    }

    const { data: workData, error: workError } = await supabase
      .from('work_times')
      .select('*')
      .order('work_date', { ascending: false });

    if (workError) {
      setError(workError.message);
      return;
    }

    const list = employeeData || [];
    setEmployees(list);
    setWorkTimes(workData || []);

    if (!editingId && !employeeForm.personnel_number) {
      setEmployeeForm((prev) => ({ ...prev, personnel_number: nextPersonnelNumber(list) }));
    }
  }

  function nextPersonnelNumber(list: Employee[]) {
    const max = list.reduce((highest, employee) => {
      const value = Number(employee.personnel_number || 0);
      return Number.isFinite(value) && value > highest ? value : highest;
    }, 0);

    return String(max + 1).padStart(3, '0');
  }

  function toggleLicense(value: string) {
    const current = employeeForm.driver_license_classes;
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    setEmployeeForm({ ...employeeForm, driver_license_classes: next });
  }

  function resetEmployeeForm() {
    setEditingId(null);
    setEmployeeForm({ ...emptyEmployeeForm, personnel_number: nextPersonnelNumber(employees) });
  }

  function editEmployee(employee: Employee) {
    setEditingId(employee.id);
    setEmployeeForm({
      personnel_number: employee.personnel_number || '',
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      role: employee.role || '',
      driver_license_classes: employee.driver_license_classes
        ? employee.driver_license_classes.split(',').map((item) => item.trim()).filter(Boolean)
        : [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveEmployee(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!supabase) {
      setError('Supabase Umgebungsvariablen fehlen.');
      return;
    }

    if (!employeeForm.name.trim()) {
      setError('Name ist erforderlich.');
      return;
    }

    const payload = {
      personnel_number: employeeForm.personnel_number.trim() || nextPersonnelNumber(employees),
      name: employeeForm.name.trim(),
      email: employeeForm.email.trim() || null,
      phone: employeeForm.phone.trim() || null,
      role: employeeForm.role.trim() || null,
      has_driver_license: employeeForm.driver_license_classes.length > 0,
      driver_license_classes: employeeForm.driver_license_classes.join(', '),
      archived: false,
    };

    const result = editingId
      ? await supabase.from('employees').update(payload).eq('id', editingId)
      : await supabase.from('employees').insert(payload);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setSuccess(editingId ? 'Mitarbeiter aktualisiert.' : 'Mitarbeiter angelegt.');
    resetEmployeeForm();
    await loadData();
  }

  async function archiveEmployee(id: string) {
    if (!supabase) {
      setError('Supabase Umgebungsvariablen fehlen.');
      return;
    }

    if (!window.confirm('Mitarbeiter wirklich archivieren?')) return;

    const { error } = await supabase.from('employees').update({ archived: true }).eq('id', id);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess('Mitarbeiter archiviert.');
    await loadData();
  }

  function breakTotalMinutes() {
    return (
      Number(timeForm.breakfast_break_minutes || 0) +
      Number(timeForm.lunch_break_minutes || 0) +
      Number(timeForm.other_break_minutes || 0)
    );
  }

  function calculatedWorkTime() {
    if (!timeForm.start_time || !timeForm.end_time) return { hours: 0, overtime: 0 };

    const start = new Date(`2000-01-01T${timeForm.start_time}`);
    const end = new Date(`2000-01-01T${timeForm.end_time}`);
    const gross = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
    const net = Math.max(0, gross - breakTotalMinutes() / 60);

    return {
      hours: Number(net.toFixed(2)),
      overtime: Number(Math.max(0, net - 8).toFixed(2)),
    };
  }

  async function saveWorkTime(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!supabase) {
      setError('Supabase Umgebungsvariablen fehlen.');
      return;
    }

    if (!timeForm.employee_id || !timeForm.work_date || !timeForm.construction_site_number || !timeForm.start_time || !timeForm.end_time) {
      setError('Mitarbeiter, Datum, Baustellen-Nr., Beginn und Ende sind erforderlich.');
      return;
    }

    const calc = calculatedWorkTime();

    const { error } = await supabase.from('work_times').insert({
      employee_id: timeForm.employee_id,
      work_date: timeForm.work_date,
      construction_site_number: timeForm.construction_site_number.trim(),
      activity: timeForm.activity.trim() || null,
      start_time: timeForm.start_time,
      end_time: timeForm.end_time,
      breakfast_break_minutes: Number(timeForm.breakfast_break_minutes || 0),
      lunch_break_minutes: Number(timeForm.lunch_break_minutes || 0),
      other_break_minutes: Number(timeForm.other_break_minutes || 0),
      break_minutes: breakTotalMinutes(),
      hours: calc.hours,
      overtime_hours: calc.overtime,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess('Arbeitszeit gespeichert.');
    setTimeForm(emptyTimeForm);
    await loadData();
  }

  function employeeSummary(employeeId: string) {
    const rows = workTimes.filter((entry) => String(entry.employee_id) === String(employeeId));
    const hours = rows.reduce((sum, entry) => sum + Number(entry.hours || 0), 0);
    const overtime = rows.reduce((sum, entry) => sum + Number(entry.overtime_hours || 0), 0);
    return { hours, overtime, entries: rows.length };
  }

  function employeeName(employeeId: string) {
    return employees.find((employee) => String(employee.id) === String(employeeId))?.name || 'Unbekannt';
  }

  const filteredEmployees = employees.filter((employee) => {
    const value = `${employee.personnel_number || ''} ${employee.name || ''} ${employee.role || ''}`.toLowerCase();
    return value.includes(search.toLowerCase());
  });

  const totals = useMemo(() => {
    const hours = workTimes.reduce((sum, entry) => sum + Number(entry.hours || 0), 0);
    const overtime = workTimes.reduce((sum, entry) => sum + Number(entry.overtime_hours || 0), 0);
    return { hours, overtime };
  }, [workTimes]);

  const preview = calculatedWorkTime();

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-3xl bg-slate-950 p-8 text-white shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">BauWerkzeug QR</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight lg:text-5xl">Mitarbeiterverwaltung</h1>
            <p className="mt-3 text-lg font-semibold text-slate-300">Personalstamm, Fuehrerscheine, Arbeitszeiten und Archivierung.</p>
          </div>
          <a href="/" className="rounded-2xl bg-white px-6 py-4 text-center text-lg font-black text-slate-950">Startseite</a>
        </header>

        {error && <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-5 text-lg font-black text-red-700">Fehler: {error}</div>}
        {success && <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 text-lg font-black text-emerald-800">{success}</div>}

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-slate-500">Aktive Mitarbeiter</p><p className="mt-3 text-5xl font-black">{employees.length}</p></div>
          <div className="rounded-3xl bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-slate-500">Gesamtstunden</p><p className="mt-3 text-5xl font-black text-blue-700">{totals.hours.toFixed(1)}</p></div>
          <div className="rounded-3xl bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-slate-500">Ueberstunden</p><p className="mt-3 text-5xl font-black text-orange-600">{totals.overtime.toFixed(1)}</p></div>
          <div className="rounded-3xl bg-white p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wide text-slate-500">Zeitnachweise</p><p className="mt-3 text-5xl font-black">{workTimes.length}</p></div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <form onSubmit={saveEmployee} className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">{editingId ? 'Mitarbeiter bearbeiten' : 'Mitarbeiter anlegen'}</h2>
                <p className="mt-1 text-sm font-bold text-slate-500">Personalnummer wird vorgeschlagen und kann manuell geändert werden.</p>
              </div>
              {editingId && <button type="button" onClick={resetEmployeeForm} className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-black">Neu</button>}
            </div>

            <div className="space-y-4">
              <div><label className={labelClass}>Personalnummer</label><input className={inputClass} value={employeeForm.personnel_number} onChange={(e) => setEmployeeForm({ ...employeeForm, personnel_number: e.target.value })} /></div>
              <div><label className={labelClass}>Name *</label><input className={inputClass} value={employeeForm.name} onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })} /></div>
              <div><label className={labelClass}>E-Mail</label><input className={inputClass} value={employeeForm.email} onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })} /></div>
              <div><label className={labelClass}>Telefon</label><input className={inputClass} value={employeeForm.phone} onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })} /></div>
              <div><label className={labelClass}>Position / Rolle</label><input className={inputClass} value={employeeForm.role} onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })} /></div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-black uppercase tracking-wide text-slate-600">Fuehrerscheinklassen</p>
                <div className="grid grid-cols-4 gap-2">
                  {licenseOptions.map((license) => (
                    <label key={license} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black shadow-sm">
                      <input type="checkbox" checked={employeeForm.driver_license_classes.includes(license)} onChange={() => toggleLicense(license)} />
                      {license}
                    </label>
                  ))}
                </div>
              </div>

              <button className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-lg font-black text-white">{editingId ? 'Mitarbeiter aktualisieren' : 'Mitarbeiter speichern'}</button>
            </div>
          </form>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-black">Mitarbeiterübersicht</h2>
                <p className="mt-1 text-sm font-bold text-slate-500">Tabellarische Übersicht mit Stunden und Aktionen.</p>
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suchen..." className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold outline-none focus:border-slate-900" />
            </div>

            <div className="overflow-auto rounded-2xl border border-slate-200">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-4 font-black">Personalnr.</th>
                    <th className="p-4 font-black">Name</th>
                    <th className="p-4 font-black">Position</th>
                    <th className="p-4 font-black">Fuehrerschein</th>
                    <th className="p-4 font-black text-right">Stunden</th>
                    <th className="p-4 font-black text-right">Ueberstunden</th>
                    <th className="p-4 font-black">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => {
                    const summary = employeeSummary(employee.id);
                    return (
                      <tr key={employee.id} className="border-t border-slate-200 align-top">
                        <td className="p-4 font-bold">{employee.personnel_number || '-'}</td>
                        <td className="p-4"><p className="font-black">{employee.name}</p><p className="mt-1 text-xs font-bold text-slate-500">{employee.email || '-'}</p><p className="text-xs font-bold text-slate-500">{employee.phone || '-'}</p></td>
                        <td className="p-4 font-bold">{employee.role || '-'}</td>
                        <td className="p-4 font-bold">{employee.driver_license_classes || '-'}</td>
                        <td className="p-4 text-right font-black text-blue-700">{summary.hours.toFixed(2)}</td>
                        <td className="p-4 text-right font-black text-orange-600">{summary.overtime.toFixed(2)}</td>
                        <td className="p-4"><div className="flex gap-2"><button type="button" onClick={() => editEmployee(employee)} className="rounded-xl bg-blue-700 px-4 py-2 font-black text-white">Bearbeiten</button><button type="button" onClick={() => archiveEmployee(employee.id)} className="rounded-xl bg-orange-500 px-4 py-2 font-black text-white">Archiv</button></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <form onSubmit={saveWorkTime} className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Arbeitszeit erfassen</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">Pausen getrennt nach Fruehstueck, Mittag und Sonstiges.</p>

            <div className="mt-5 space-y-4">
              <div><label className={labelClass}>Mitarbeiter *</label><select className={inputClass} value={timeForm.employee_id} onChange={(e) => setTimeForm({ ...timeForm, employee_id: e.target.value })}><option value="">Bitte auswählen</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select></div>
              <div><label className={labelClass}>Datum *</label><input className={inputClass} type="date" value={timeForm.work_date} onChange={(e) => setTimeForm({ ...timeForm, work_date: e.target.value })} /></div>
              <div><label className={labelClass}>Baustellen-Nr. *</label><input className={inputClass} value={timeForm.construction_site_number} onChange={(e) => setTimeForm({ ...timeForm, construction_site_number: e.target.value })} /></div>
              <div><label className={labelClass}>Tätigkeit / Beschreibung</label><input className={inputClass} value={timeForm.activity} onChange={(e) => setTimeForm({ ...timeForm, activity: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>Beginn *</label><input className={inputClass} type="time" value={timeForm.start_time} onChange={(e) => setTimeForm({ ...timeForm, start_time: e.target.value })} /></div><div><label className={labelClass}>Ende *</label><input className={inputClass} type="time" value={timeForm.end_time} onChange={(e) => setTimeForm({ ...timeForm, end_time: e.target.value })} /></div></div>
              <div className="grid grid-cols-3 gap-3"><div><label className={labelClass}>Fruehstueck</label><input className={inputClass} type="number" value={timeForm.breakfast_break_minutes} onChange={(e) => setTimeForm({ ...timeForm, breakfast_break_minutes: e.target.value })} /></div><div><label className={labelClass}>Mittag</label><input className={inputClass} type="number" value={timeForm.lunch_break_minutes} onChange={(e) => setTimeForm({ ...timeForm, lunch_break_minutes: e.target.value })} /></div><div><label className={labelClass}>Sonstiges</label><input className={inputClass} type="number" value={timeForm.other_break_minutes} onChange={(e) => setTimeForm({ ...timeForm, other_break_minutes: e.target.value })} /></div></div>
              <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-blue-50 p-4 text-center"><p className="text-xs font-black uppercase text-blue-900">Nettozeit</p><p className="mt-1 text-3xl font-black text-blue-800">{preview.hours.toFixed(2)} h</p></div><div className="rounded-2xl bg-orange-50 p-4 text-center"><p className="text-xs font-black uppercase text-orange-900">Ueberstunden</p><p className="mt-1 text-3xl font-black text-orange-700">{preview.overtime.toFixed(2)} h</p></div></div>
              <button className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-lg font-black text-white">Arbeitszeit speichern</button>
            </div>
          </form>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Arbeitszeitnachweise</h2>
            <div className="mt-5 overflow-auto rounded-2xl border border-slate-200">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-slate-700"><tr><th className="p-4 font-black">Datum</th><th className="p-4 font-black">Mitarbeiter</th><th className="p-4 font-black">Baustelle</th><th className="p-4 font-black">Tätigkeit</th><th className="p-4 font-black">Zeit</th><th className="p-4 font-black text-right">Pause</th><th className="p-4 font-black text-right">Stunden</th><th className="p-4 font-black text-right">ÜStd.</th></tr></thead>
                <tbody>
                  {workTimes.map((entry) => (
                    <tr key={entry.id} className="border-t border-slate-200"><td className="p-4 font-bold">{entry.work_date}</td><td className="p-4 font-bold">{employeeName(entry.employee_id)}</td><td className="p-4 font-bold">{entry.construction_site_number || '-'}</td><td className="p-4 font-bold">{entry.activity || '-'}</td><td className="p-4 font-bold">{entry.start_time} - {entry.end_time}</td><td className="p-4 text-right font-bold">{entry.break_minutes || 0} Min.</td><td className="p-4 text-right font-black text-blue-700">{Number(entry.hours || 0).toFixed(2)}</td><td className="p-4 text-right font-black text-orange-600">{Number(entry.overtime_hours || 0).toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
