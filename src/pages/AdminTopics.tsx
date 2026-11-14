import { useCallback, useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import Button from "../components/Button"
import DifficultyMark from "../components/DifficultyMark"
import TextField from "../components/TextField"
import { apiError } from "../service/errors"
import {
  createTopic,
  deleteTopic,
  getTopics,
  updateTopic
} from "../service/topic"
import type { Difficulty, Topic, TopicInput } from "../types/topic"

const LEVELS: { value: Difficulty; label: string }[] = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" }
]

const EMPTY: TopicInput = {
  title: "",
  description: "",
  category: "",
  difficulty: "BEGINNER"
}

export default function AdminTopics() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [form, setForm] = useState<TopicInput>(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setTopics(await getTopics())
      setLoadError(null)
    } catch (err) {
      setLoadError(apiError(err, "Could not load topics."))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const categories = useMemo(
    () => Array.from(new Set(topics.map((t) => t.category))).sort(),
    [topics]
  )

  const setField = <K extends keyof TopicInput>(key: K, value: TopicInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const resetForm = () => {
    setForm(EMPTY)
    setEditingId(null)
    setFormError(null)
  }

  const startEdit = (topic: Topic) => {
    setEditingId(topic._id)
    setForm({
      title: topic.title,
      description: topic.description,
      category: topic.category,
      difficulty: topic.difficulty
    })
    setFormError(null)
    setNotice(null)
    document.getElementById("title")?.focus()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setNotice(null)

    const payload: TopicInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      difficulty: form.difficulty
    }

    if (!payload.title || !payload.description || !payload.category) {
      setFormError("Title, category and description are all required.")
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        await updateTopic(editingId, payload)
        setNotice(`Updated ${payload.title}.`)
      } else {
        await createTopic(payload)
        setNotice(`Added ${payload.title}.`)
      }
      resetForm()
      await load()
    } catch (err) {
      setFormError(apiError(err, "Could not save the topic. Try again."))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (topic: Topic) => {
    setListError(null)
    setDeletingId(topic._id)
    try {
      await deleteTopic(topic._id)
      if (editingId === topic._id) resetForm()
      setConfirmId(null)
      setNotice(`Deleted ${topic.title}.`)
      await load()
    } catch (err) {
      setListError(apiError(err, "Could not delete the topic."))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">Manage topics</h1>
      <p className="mt-3 max-w-2xl font-serif text-xl leading-relaxed text-ink-soft">
        Add, edit or remove the concepts learners can explain.
      </p>

      <div role="status" aria-live="polite" className="mt-4 min-h-12">
        {notice && (
          <p className="rounded-md bg-good-wash px-3.5 py-3 text-sm font-semibold text-good">
            {notice}
          </p>
        )}
      </div>

      <div className="mt-2 grid gap-12 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <section aria-labelledby="form-title">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-md border border-line bg-sheet p-6"
          >
            <h2 id="form-title" className="text-xl font-bold">
              {editingId ? "Edit topic" : "Add a topic"}
            </h2>

            <TextField
              label="Title"
              required
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
            />

            <TextField
              label="Category"
              required
              list="category-options"
              hint="Pick an existing one or type a new one."
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
            />
            <datalist id="category-options">
              {categories.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>

            <fieldset>
              <legend className="mb-1.5 text-sm font-semibold">Difficulty</legend>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    aria-pressed={form.difficulty === level.value}
                    onClick={() => setField("difficulty", level.value)}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                      form.difficulty === level.value
                        ? "border-ink bg-ink text-white"
                        : "border-line bg-sheet hover:border-ink"
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-semibold"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={5}
                required
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                className="w-full rounded-md border border-line bg-sheet px-3.5 py-3 font-serif text-base focus:border-ink"
              />
              <p className="mt-1.5 text-sm text-ink-soft">
                Learners read this, and the AI tutor uses it as context when it
                marks explanations.
              </p>
            </div>

            {formError && (
              <p
                role="alert"
                className="rounded-md bg-flag-wash px-3.5 py-3 text-sm text-flag"
              >
                {formError}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" loading={saving} loadingText="Saving...">
                {editingId ? "Save changes" : "Add topic"}
              </Button>
              {editingId && (
                <Button type="button" variant="quiet" onClick={resetForm}>
                  Cancel edit
                </Button>
              )}
            </div>
          </form>
        </section>

        <section aria-labelledby="list-title">
          <h2 id="list-title" className="text-xl font-bold">
            All topics ({topics.length})
          </h2>

          {listError && (
            <p
              role="alert"
              className="mt-3 rounded-md bg-flag-wash px-3.5 py-3 text-sm text-flag"
            >
              {listError}
            </p>
          )}

          {loading && <p className="mt-4 text-ink-soft">Loading topics...</p>}

          {loadError && (
            <p
              role="alert"
              className="mt-4 rounded-md bg-flag-wash px-3.5 py-3 text-flag"
            >
              {loadError}
            </p>
          )}

          {!loading && !loadError && topics.length === 0 && (
            <p className="mt-4 text-ink-soft">
              No topics yet. Add the first one with the form.
            </p>
          )}

          <ul className="mt-4 border-t border-line">
            {topics.map((topic) => (
              <li key={topic._id} className="border-b border-line py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold">{topic.title}</h3>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-4 text-sm text-ink-soft">
                      <span>{topic.category}</span>
                      <DifficultyMark level={topic.difficulty} />
                    </p>
                  </div>

                  <div className="flex gap-4 text-sm font-semibold">
                    <button
                      type="button"
                      aria-label={`Edit ${topic.title}`}
                      onClick={() => startEdit(topic)}
                      className="underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${topic.title}`}
                      onClick={() => setConfirmId(topic._id)}
                      className="text-flag underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {confirmId === topic._id && (
                  <div className="mt-3 flex flex-wrap items-center gap-3 rounded-md bg-flag-wash px-3.5 py-3 text-sm">
                    <span>Delete this topic? Learners will no longer see it.</span>
                    <Button
                      size="sm"
                      onClick={() => handleDelete(topic)}
                      loading={deletingId === topic._id}
                      loadingText="Deleting..."
                    >
                      Yes, delete
                    </Button>
                    <Button
                      size="sm"
                      variant="quiet"
                      onClick={() => setConfirmId(null)}
                    >
                      Keep it
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}