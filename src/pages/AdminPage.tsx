import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { useModules } from "../db/collections/useModules";
import { useAuth } from "../providers/AuthProvider";
import type { Module } from "../features/curriculum/types";

export function AdminPage() {
  const { user } = useAuth();
  const { data: modules = [], refetch } = useModules();
  const [message, setMessage] = useState("");

  async function removeModule(id: string) {
    const response = await fetch(`/api/admin/modules?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      setMessage("Delete failed");
      return;
    }
    setMessage(`Deleted ${id}`);
    await refetch();
  }

  async function duplicateAsDraft(module: Module) {
    const draft: Module = {
      ...module,
      id: `${module.id}-draft-${Date.now()}`,
      title: `${module.title} (draft)`,
    };
    const response = await fetch("/api/admin/modules", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ module: draft, orderIndex: 9999 }),
    });
    if (!response.ok) {
      setMessage("Create failed");
      return;
    }
    setMessage(`Created ${draft.id}`);
    await refetch();
  }

  return (
    <AppShell user={user}>
      <h1 className="mb-2 text-3xl font-bold">Admin — curriculum CRUD</h1>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Manage modules in Postgres. Set <code>ADMIN_EMAIL</code> in env and run <code>pnpm db:promote-admin</code> for access.
      </p>
      {message ? <p className="mb-3 text-sm text-indigo-200">{message}</p> : null}

      <div className="overflow-x-auto glass">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[var(--border)] text-[var(--muted)]">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Track</th>
              <th className="p-3">Difficulty</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => (
              <tr key={module.id} className="border-b border-[var(--border)]/60">
                <td className="p-3">{module.title}</td>
                <td className="p-3">{module.track}</td>
                <td className="p-3">{module.difficulty}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="btn btn-ghost" onClick={() => void duplicateAsDraft(module)}>Duplicate</button>
                    <button className="btn btn-ghost text-[var(--danger)]" onClick={() => void removeModule(module.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
