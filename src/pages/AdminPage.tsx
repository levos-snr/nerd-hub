import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { LoadingButton } from "../components/ui/LoadingButton";
import { useModules } from "../db/collections/useModules";
import { useAuth } from "../hooks/useAuth";
import type { Module } from "../features/curriculum/types";

type AdminTab = "modules" | "learners" | "tools";

type LearnerRow = {
  progressId: string;
  userId: string;
  email: string;
  name: string;
  xp: number;
  streak: number;
  level: number;
  completedModuleIds: string[];
};

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
    example: "// example\nconsole.log('hi');",
    clue: "Read the example first, then implement solve().",
  },
  quiz: [
    { id: "q1", prompt: "Question 1?", options: ["A", "B", "C", "D"], answerIndex: 1 },
    { id: "q2", prompt: "Question 2?", options: ["A", "B", "C", "D"], answerIndex: 0 },
    { id: "q3", prompt: "Question 3?", options: ["A", "B", "C", "D"], answerIndex: 2 },
  ],
  challenge: {
    prompt: "Implement solve",
    starterCode: "export function solve(input) {\n  return input;\n}\n",
    language: "javascript",
    tests: [{ label: "echo", input: 1, expected: 1 }],
    hint: "Return the input unchanged.",
  },
});

export function AdminPage() {
  const { user } = useAuth();
  const { data: modules = [], refetch } = useModules();
  const [tab, setTab] = useState<AdminTab>("modules");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Module | null>(null);
  const [orderIndex, setOrderIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [learners, setLearners] = useState<LearnerRow[]>([]);
  const [loadingLearners, setLoadingLearners] = useState(false);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...modules].sort((a, b) => a.title.localeCompare(b.title)),
    [modules],
  );

  const loadLearners = useCallback(async () => {
    setLoadingLearners(true);
    try {
      const res = await fetch("/api/admin/progress", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load learners");
      const data = (await res.json()) as { learners: LearnerRow[] };
      setLearners(data.learners);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoadingLearners(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "learners") void loadLearners();
  }, [tab, loadLearners]);

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

  async function syncCatalog() {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/sync", { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Sync failed");
      const data = (await res.json()) as { upserted: number };
      setMessage(`Synced ${data.upserted} modules from source code.`);
      await refetch();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function resetLearner(userId: string) {
    if (!confirm(`Reset all progress for this learner?`)) return;
    setResettingUserId(userId);
    try {
      const res = await fetch("/api/admin/progress", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, reset: true }),
      });
      if (!res.ok) throw new Error("Reset failed");
      setMessage(`Reset progress for ${userId}`);
      await loadLearners();
    } catch {
      setMessage("Reset failed");
    } finally {
      setResettingUserId(null);
    }
  }

  return (
    <AppShell user={user}>
      <h1 className="mb-2 text-3xl font-bold">Admin</h1>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Full CRUD for modules, learners, and catalog tools.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["modules", "learners", "tools"] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={`btn ${tab === t ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {message ? <p className="mb-3 text-sm text-indigo-200">{message}</p> : null}

      {tab === "modules" ? (
        <>
          <div className="mb-4">
            <button
              type="button"
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
            <div className="glass mb-6 max-h-[70vh] space-y-3 overflow-y-auto p-4">
              <h2 className="text-lg font-semibold">Edit module</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="input"
                  placeholder="ID"
                  value={editing.id}
                  onChange={(e) => setEditing({ ...editing, id: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Title"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
                <select
                  className="input"
                  value={editing.track}
                  onChange={(e) =>
                    setEditing({ ...editing, track: e.target.value as Module["track"] })
                  }
                >
                  <option value="javascript">javascript</option>
                  <option value="typescript">typescript</option>
                </select>
                <select
                  className="input"
                  value={editing.difficulty}
                  onChange={(e) =>
                    setEditing({ ...editing, difficulty: e.target.value as Module["difficulty"] })
                  }
                >
                  <option value="beginner">beginner</option>
                  <option value="intermediate">intermediate</option>
                  <option value="advanced">advanced</option>
                  <option value="pro">pro</option>
                </select>
                <input
                  className="input"
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                />
                <input
                  className="input"
                  placeholder="Prerequisites (comma ids)"
                  value={editing.prerequisites.join(",")}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      prerequisites: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
              <textarea
                className="input min-h-[80px]"
                value={editing.lesson.content}
                onChange={(e) =>
                  setEditing({ ...editing, lesson: { ...editing.lesson, content: e.target.value } })
                }
              />
              <textarea
                className="input min-h-[60px]"
                placeholder="Beginner clue"
                value={editing.lesson.clue ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, lesson: { ...editing.lesson, clue: e.target.value } })
                }
              />
              <textarea
                className="input min-h-[80px] font-mono text-xs"
                value={editing.lesson.example}
                onChange={(e) =>
                  setEditing({ ...editing, lesson: { ...editing.lesson, example: e.target.value } })
                }
              />
              <textarea
                className="input min-h-[60px]"
                placeholder="Challenge prompt"
                value={editing.challenge.prompt}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    challenge: { ...editing.challenge, prompt: e.target.value },
                  })
                }
              />
              <textarea
                className="input min-h-[120px] font-mono text-xs"
                value={editing.challenge.starterCode}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    challenge: { ...editing.challenge, starterCode: e.target.value },
                  })
                }
              />
              <textarea
                className="input min-h-[100px] font-mono text-xs"
                value={JSON.stringify(editing.challenge.tests, null, 2)}
                onChange={(e) => {
                  try {
                    const tests = JSON.parse(e.target.value) as Module["challenge"]["tests"];
                    setEditing({ ...editing, challenge: { ...editing.challenge, tests } });
                  } catch {
                    /* typing */
                  }
                }}
              />
              <textarea
                className="input min-h-[120px] font-mono text-xs"
                value={JSON.stringify(editing.quiz, null, 2)}
                onChange={(e) => {
                  try {
                    const quiz = JSON.parse(e.target.value) as Module["quiz"];
                    setEditing({ ...editing, quiz });
                  } catch {
                    /* typing */
                  }
                }}
              />
              <div className="flex gap-2">
                <LoadingButton
                  loading={saving}
                  loadingLabel="Saving…"
                  onClick={() => void saveModule()}
                >
                  Save module
                </LoadingButton>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          <div className="overflow-x-auto glass">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-[var(--border)] text-[var(--muted)]">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Track</th>
                  <th className="p-3">Level</th>
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
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => {
                            setEditing(module);
                            setOrderIndex(modules.indexOf(module));
                          }}
                        >
                          Edit
                        </button>
                        <LoadingButton
                          variant="ghost"
                          loading={duplicatingId === module.id}
                          loadingLabel="…"
                          onClick={() => void duplicateAsDraft(module)}
                        >
                          Duplicate
                        </LoadingButton>
                        <LoadingButton
                          variant="ghost"
                          className="text-[var(--danger)]"
                          loading={deletingId === module.id}
                          loadingLabel="…"
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
        </>
      ) : null}

      {tab === "learners" ? (
        <div className="glass overflow-x-auto">
          {loadingLearners ? <p className="p-4">Loading…</p> : null}
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-[var(--muted)]">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">XP</th>
                <th className="p-3">Level</th>
                <th className="p-3">Completed</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {learners.map((l) => (
                <tr key={l.userId} className="border-b border-[var(--border)]/60">
                  <td className="p-3">{l.email}</td>
                  <td className="p-3">{l.xp}</td>
                  <td className="p-3">{l.level}</td>
                  <td className="p-3">{l.completedModuleIds.length}</td>
                  <td className="p-3">
                    <LoadingButton
                      variant="ghost"
                      loading={resettingUserId === l.userId}
                      loadingLabel="…"
                      onClick={() => void resetLearner(l.userId)}
                    >
                      Reset progress
                    </LoadingButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "tools" ? (
        <div className="glass space-y-4 p-6">
          <div>
            <h2 className="font-semibold">Sync catalog from code</h2>
            <p className="mb-3 text-sm text-[var(--muted)]">
              Upserts all modules from buildModules (W3Schools syllabus). Run after content updates.
            </p>
            <LoadingButton
              loading={syncing}
              loadingLabel="Syncing…"
              onClick={() => void syncCatalog()}
            >
              Run db:sync-modules
            </LoadingButton>
          </div>
          <div>
            <h2 className="font-semibold">Health check</h2>
            <p className="text-sm text-[var(--muted)]">
              Open{" "}
              <a
                href="/api/health"
                className="text-[var(--accent)] underline"
                target="_blank"
                rel="noreferrer"
              >
                /api/health
              </a>{" "}
              to verify database connectivity.
            </p>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
