"use client";
TEST TEST TEST
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const licenseOptions = [
  "AM",
  "A",
  "A1",
  "A2",
  "B",
  "BE",
  "C",
  "CE",
  "C1",
  "C1E",
  "D",
  "DE",
  "L",
  "T",
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [workTimes, setWorkTimes] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    personnel_number: "",
    email: "",
    phone: "",
    role: "",
    has_driver_license: false,
    driver_license_classes: [] as string[],
  });

  const [timeForm, setTimeForm] = useState({
    employee_id: "",
    construction_site_number: "",
    activity: "",
    work_date: "",
    start_time: "",
    end_time: "",
    break_minutes: 30,
  });

  async function loadEmployees() {
    const { data } = await supabase
      .from("employees")
      .select("*")
      .eq("archived", false)
      .order("name");

    setEmployees(data || []);
  }

  async function loadWorkTimes() {
    const { data } = await supabase
      .from("work_times")
      .select("*")
      .order("work_date", { ascending: false });

    setWorkTimes(data || []);
  }

  useEffect(() => {
    loadEmployees();
    loadWorkTimes();
  }, []);

  async function saveEmployee(e: any) {
    e.preventDefault();

    await supabase.from("employees").insert({
      ...form,
      driver_license_classes: form.driver_license_classes.join(", "),
    });

    setForm({
      name: "",
      personnel_number: "",
      email: "",
      phone: "",
      role: "",
      has_driver_license: false,
      driver_license_classes: [],
    });

    loadEmployees();
  }

  async function archiveEmployee(id: string) {
    await supabase
      .from("employees")
      .update({ archived: true })
      .eq("id", id);

    loadEmployees();
  }

  async function saveWorkTime(e: any) {
    e.preventDefault();

    const start = new Date(`2024-01-01T${timeForm.start_time}`);
    const end = new Date(`2024-01-01T${timeForm.end_time}`);

    const diff =
      (end.getTime() - start.getTime()) / 1000 / 60 / 60 -
      timeForm.break_minutes / 60;

    const overtime = diff > 8 ? diff - 8 : 0;

    await supabase.from("work_times").insert({
      ...timeForm,
      hours: diff,
      overtime_hours: overtime,
    });

    setTimeForm({
      employee_id: "",
      construction_site_number: "",
      activity: "",
      work_date: "",
      start_time: "",
      end_time: "",
      break_minutes: 30,
    });

    loadWorkTimes();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <h1 className="text-4xl font-bold text-slate-800">
          Mitarbeiterverwaltung
        </h1>

        <div className="grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={saveEmployee}
            className="rounded-3xl bg-white p-6 shadow"
          >
            <h2 className="mb-6 text-2xl font-bold">
              Mitarbeiter anlegen
            </h2>

            <div className="grid gap-4">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="rounded-xl border p-3"
              />

              <input
                placeholder="Personalnummer"
                value={form.personnel_number}
                onChange={(e) =>
                  setForm({
                    ...form,
                    personnel_number: e.target.value,
                  })
                }
                className="rounded-xl border p-3"
              />

              <input
                placeholder="E-Mail"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="rounded-xl border p-3"
              />

              <input
                placeholder="Telefon"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                className="rounded-xl border p-3"
              />

              <input
                placeholder="Rolle"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
                className="rounded-xl border p-3"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.has_driver_license}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      has_driver_license: e.target.checked,
                    })
                  }
                />
                Führerschein vorhanden
              </label>

              <div className="rounded-2xl border p-4">
                <p className="mb-3 font-bold">
                  Führerscheinklassen
                </p>

                <div className="grid grid-cols-4 gap-2">
                  {licenseOptions.map((license) => (
                    <label
                      key={license}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={form.driver_license_classes.includes(
                          license
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({
                              ...form,
                              driver_license_classes: [
                                ...form.driver_license_classes,
                                license,
                              ],
                            });
                          } else {
                            setForm({
                              ...form,
                              driver_license_classes:
                                form.driver_license_classes.filter(
                                  (l) => l !== license
                                ),
                            });
                          }
                        }}
                      />
                      {license}
                    </label>
                  ))}
                </div>
              </div>

              <button
                className="rounded-2xl bg-slate-900 p-4 text-white"
              >
                Mitarbeiter speichern
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="rounded-3xl bg-white p-6 shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {employee.name}
                    </h2>

                    <p>
                      Personalnummer:{" "}
                      {employee.personnel_number}
                    </p>

                    <p>Telefon: {employee.phone}</p>

                    <p>Rolle: {employee.role}</p>

                    <p>
                      Führerschein:{" "}
                      {employee.has_driver_license
                        ? "Ja"
                        : "Nein"}
                    </p>

                    <p>
                      Klassen:{" "}
                      {employee.driver_license_classes}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      archiveEmployee(employee.id)
                    }
                    className="rounded-xl bg-orange-500 px-4 py-2 text-white"
                  >
                    Archivieren
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={saveWorkTime}
            className="rounded-3xl bg-white p-6 shadow"
          >
            <h2 className="mb-6 text-3xl font-bold">
              Arbeitszeit erfassen
            </h2>

            <div className="grid gap-4">
              <select
                value={timeForm.employee_id}
                onChange={(e) =>
                  setTimeForm({
                    ...timeForm,
                    employee_id: e.target.value,
                  })
                }
                className="rounded-xl border p-3"
              >
                <option value="">
                  Mitarbeiter auswählen
                </option>

                {employees.map((employee) => (
                  <option
                    key={employee.id}
                    value={employee.id}
                  >
                    {employee.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="Baustellennummer"
                value={timeForm.construction_site_number}
                onChange={(e) =>
                  setTimeForm({
                    ...timeForm,
                    construction_site_number:
                      e.target.value,
                  })
                }
                className="rounded-xl border p-3"
              />

              <input
                placeholder="Tätigkeit"
                value={timeForm.activity}
                onChange={(e) =>
                  setTimeForm({
                    ...timeForm,
                    activity: e.target.value,
                  })
                }
                className="rounded-xl border p-3"
              />

              <input
                type="date"
                value={timeForm.work_date}
                onChange={(e) =>
                  setTimeForm({
                    ...timeForm,
                    work_date: e.target.value,
                  })
                }
                className="rounded-xl border p-3"
              />

              <input
                type="time"
                value={timeForm.start_time}
                onChange={(e) =>
                  setTimeForm({
                    ...timeForm,
                    start_time: e.target.value,
                  })
                }
                className="rounded-xl border p-3"
              />

              <input
                type="time"
                value={timeForm.end_time}
                onChange={(e) =>
                  setTimeForm({
                    ...timeForm,
                    end_time: e.target.value,
                  })
                }
                className="rounded-xl border p-3"
              />

              <input
                type="number"
                placeholder="Pause in Minuten"
                value={timeForm.break_minutes}
                onChange={(e) =>
                  setTimeForm({
                    ...timeForm,
                    break_minutes: Number(
                      e.target.value
                    ),
                  })
                }
                className="rounded-xl border p-3"
              />

              <button
                className="rounded-2xl bg-blue-600 p-4 text-white"
              >
                Arbeitszeit speichern
              </button>
            </div>
          </form>

          <div className="rounded-3xl bg-white p-6 shadow">
            <h2 className="mb-6 text-3xl font-bold">
              Arbeitszeitnachweise
            </h2>

            <div className="space-y-4">
              {workTimes.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border p-4"
                >
                  <p>
                    Baustelle:{" "}
                    {entry.construction_site_number}
                  </p>

                  <p>
                    Tätigkeit: {entry.activity}
                  </p>

                  <p>Datum: {entry.work_date}</p>

                  <p>
                    Stunden:{" "}
                    {Number(entry.hours).toFixed(2)}
                  </p>

                  <p>
                    Überstunden:{" "}
                    {Number(
                      entry.overtime_hours
                    ).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}