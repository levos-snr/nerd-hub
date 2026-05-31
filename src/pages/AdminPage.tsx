import { useMemo, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { LoadingButton } from "../components/ui/LoadingButton";
import { useModules } from "../db/collections/useModules";
import { useAuth } from "../hooks/useAuth";
import type { Module } from "../features/curriculum/types";

const emptyModule = (): Module => ({
  id: `custom-${Date.now()}`,
  track: "javascript",
  title: "New module",
  difficulty: "beginner",
  prerequisites: [],
  passScore: 70,
  lesson: {
    id: "lesson-1",
    title: "Lesson",
    content: "Lesson content",
    objectives: ["Learn something new"],
    example: "// example",
  },
  quiz: [
    {
      id: "q1",
      prompt: "Question 1?",
      options: ["A", "B", "C", "D"],
      answerIndex: 1,
    },
  ],
  challenge: {
    prompt: "Implement solve",
    starterCode: "export function solve(input) {\n  return input;\n}\n",
    language: "javascript",
    tests: [{ label: "echo", input: 1, expected: 1 }],
  },
});

export function AdminPage() {
  const { user } = useAuth();
  const { data: modules = [], refetch } = useModules();
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Module | null>(null);
  const [orderIndex, setOrderIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...modules].sort((a, b) => a.title.localeCompare(b.title)),
    [modules]
  );

  async function saveModule() {
    if (!editing) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/modules", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ module: editing, orderIndex }),
      });
      if (!response.ok) {
        const err = (await response.json()) as { error?: string };
        throw new Error(err.error ?? "Save failed");
      }
      setMessage(`Saved ${editing.id}`);
      setEditing(null);
      await refetch();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function removeModule(id: string) {
    if (!confirm(`Delete module ${id}?`)) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/modules?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Delete failed");
      setMessage(`Deleted ${id}`);
      await refetch();
    } catch {
      setMessage("Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  async function duplicateAsDraft(module: Module) {
    setDuplicatingId(module.id);
    const draft: Module = {
      ...module,
      id: `${module.id}-draft-${Date.now()}`,
      title: `${module.title} (draft)`,
      lesson: { ...module.lesson, id: `${module.lesson.id}-draft` },
    };
    try {
      const response = await fetch("/api/admin/modules", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ module: draft, orderIndex: 9999 }),
      });
      if (!response.ok) throw new Error("Create failed");
      setMessage(`Created ${draft.id}`);
      await refetch();
    } catch {
      setMessage("Create failed");
    } finally {
      setDuplicatingId(null);
    }
  }

  return (
    <AppShell user={user}>
      <h1 className="mb-2 text-3xl font-bold">Admin — curriculum</h1>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Create, edit, duplicate, or delete modules. Run <code>pnpm db:sync-modules</code> to refresh from code.
      </p>
      {message ? <p className="mb-3 text-sm text-indigo-200">{message}</p> : null}

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(emptyModule());
            setOrderIndex(modules.length);
          }}
        >
          New module
        </button>
      </div>

      {editing ? (
        <div className="glass mb-6 space-y-3 p-4">
          <h2 className="text-lg font-semibold">Edit module</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input" placeholder="ID" value={editing.id} onChange={(e) => setEditing({ ...editing, id: e.target.value })} />
            <input className="input" placeholder="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <select
              className="input"
              value={editing.track}
              onChange={(e) => setEditing({ ...editing, track: e.target.value as Module["track"] })}
            >
              <option value="javascript">javascript</option>
              <option value="typescript">typescript</option>
            </select>
            <select
              className="input"
              value={editing.difficulty}
              onChange={(e) => setEditing({ ...editing, difficulty: e.target.value as Module["difficulty"] })}
            >
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
              <option value="pro">pro</option>
            </select>
            <input
              className="input"
              type="number"
              placeholder="Order index"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
            />
            <input
              className="input"
              placeholder="Prerequisites (comma-separated ids)"
              value={editing.prerequisites.join(",")}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  prerequisites: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
            />
          </div>
          <textarea
            className="input min-h-[80px]"
            placeholder="Lesson content"
            value={editing.lesson.content}
            onChange={(e) => setEditing({ ...editing, lesson: { ...editing.lesson, content: e.target.value } })}
          />
          <textarea
            className="input min-h-[80px] font-mono text-xs"
            placeholder="Lesson example"
            value={editing.lesson.example}
            onChange={(e) => setEditing({ ...editing, lesson: { ...editing.lesson, example: e.target.value } })}
          />
          <textarea
            className="input min-h-[120px] font-mono text-xs"
            placeholder="Challenge starter code"
            value={editing.challenge.starterCode}
            onChange={(e) =>
              setEditing({ ...editing, challenge: { ...editing.challenge, starterCode: e.target.value } })
            }
          />
          <textarea
            className="input min-h-[100px] font-mono text-xs"
            placeholder="Challenge tests JSON"
            value={JSON.stringify(editing.challenge.tests, null, 2)}
            onChange={(e) => {
              try {
                const tests = JSON.parse(e.target.value) as Module["challenge"]["tests"];
                setEditing({ ...editing, challenge: { ...editing.challenge, tests } });
              } catch {
                /* ignore invalid JSON while typing */
              }
            }}
          />
          <div className="flex gap-2">
            <LoadingButton loading={saving} loadingLabel="Saving..." onClick={() => void saveModule()}>
              Save module
            </LoadingButton>
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      ) : null}

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
            {sorted.map((module) => (
              <tr key={module.id} className="border-b border-[var(--border)]/60">
                <td className="p-3">{module.title}</td>
                <td className="p-3">{module.track}</td>
                <td className="p-3">{module.difficulty}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="btn btn-ghost" onClick={() => { setEditing(module); setOrderIndex(modules.indexOf(module)); }}>
                      Edit
                    </button>
                    <LoadingButton
                      variant="ghost"
                      loading={duplicatingId === module.id}
                      loadingLabel="..."
                      onClick={() => void duplicateAsDraft(module)}
                    >
                      Duplicate
                    </LoadingButton>
                    <LoadingButton
                      variant="ghost"
                      className="text-[var(--danger)]"
                      loading={deletingId === module.id}
                      loadingLabel="..."
                      onClick={() => void removeModule(module.id)}
                    >
                      Delete
                    </LoadingButton>
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
