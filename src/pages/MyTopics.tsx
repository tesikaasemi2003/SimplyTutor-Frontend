import { useCallback, useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router-dom"
import Button from "../components/Button"
import DifficultyMark from "../components/DifficultyMark"
import TextField from "../components/TextField"
import TopicBadge from "../components/TopicBadge"
import { useAppSelector } from "../hooks/redux"
import { apiError } from "../service/errors"
import {
  cancelPublishRequest,
  createTopic,
  deleteTopic,
  getTopics,
  requestPublish,
  updateTopic
} from "../service/topic"
import { TOPIC_LIMITS } from "../types/topic"
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

export default function MyTopics() {
  const userId = useAppSelector((state) => state.auth.user?.id)

  const [all, setAll] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [form, setForm] = useState<TopicInput>(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setAll(await getTopics())
      setLoadError(null)
    } catch (err) {
      setLoadError(apiError(err, "Could not load your topics."))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // only my private topics (published ones belong to everyone now)
  const mine = useMemo(
    () =>
      all.filter((t) => t.visibility === "PRIVATE" && t.createdBy === userId),
    [all, userId]
  )

  // existing categories (public + mine) to suggest while typing
  const categories = useMemo(
    () => Array.from(new Set(all.map((t) => t.category))).sort(),
    [all]
  )

  const atLimit = mine.length >= TOPIC_LIMITS.maxPrivate && !editingId

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
        setNotice(`Added ${payload.title}. Only you can see it.`)
      }
      resetForm()
      await load()
    } catch (err) {
      setFormError(apiError(err, "Could not save the topic. Try again."))
    } finally {
      setSaving(false)
    }
  }

  // runs one action on one topic, then refreshes the list
  const runOn = async (
    topic: Topic,
    action: () => Promise<unknown>,
    success: string,
    failure: string
  ) => {
    setListError(null)
    setNotice(null)
    setBusyId(topic._id)
    try {
      await action()
      setNotice(success)
      await load()
    } catch (err) {
      setListError(apiError(err, failure))
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (topic: Topic) => {
    await runOn(
      topic,
      async () => {
        await deleteTopic(topic._id)
        if (editingId === topic._id) resetForm()
        setConfirmId(null)
      },
      `Deleted ${topic.title}.`,
      "Could not delete the topic."
    )
  }

  const handleSuggest = (topic: Topic) =>
    runOn(
      topic,
      () => requestPublish(topic._id),
      `Sent ${topic.title} to the admin for review.`,
      "Could not send the request."
    )

  const handleCancel = (topic: Topic) =>
    runOn(
      topic,
      () => cancelPublishRequest(topic._id),
      `Cancelled the request for ${topic.title}.`,
      "Could not cancel the request."
    )

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">My topics</h1>
      <p className="mt-3 max-w-2xl font-serif text-xl leading-relaxed text-ink-soft">
        Add a concept you want to practise. Only you can see it. If it is a good
        one, suggest it to everyone and an admin will review it.
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
              {editingId ? "Edit topic" : "Add a private topic"}
            </h2>

            <TextField
              label="Title"
              required
              maxLength={TOPIC_LIMITS.title}
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
            />

            <TextField
              label="Category"
              required
              list="category-options"
              maxLength={TOPIC_LIMITS.category}
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
                maxLength={TOPIC_LIMITS.description}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                className="w-full rounded-md border border-line bg-sheet px-3.5 py-3 font-serif text-base focus:border-ink"
              />
              <p className="mt-1.5 text-sm text-ink-soft">
                Say what the topic covers. The AI tutor uses this to mark your
                explanations and write your quizzes. (
                {form.description.length}/{TOPIC_LIMITS.description})
              </p>
            </div>

            {atLimit && (
              <p className="rounded-md bg-marker/60 px-3.5 py-3 text-sm">
                You have {TOPIC_LIMITS.maxPrivate} private topics, which is the
                limit. Delete one to add another.
              </p>
            )}

            {formError && (
              <p
                role="alert"
                className="rounded-md bg-flag-wash px-3.5 py-3 text-sm text-flag"
              >
                {formError}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                loading={saving}
                loadingText="Saving..."
                disabled={atLimit}
              >
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
            Your private topics ({mine.length}/{TOPIC_LIMITS.maxPrivate})
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

          {!loading && !loadError && mine.length === 0 && (
            <p className="mt-4 text-ink-soft">
              Nothing here yet. Add your first topic with the form.
            </p>
          )}

          <ul className="mt-4 border-t border-line">
            {mine.map((topic) => {
              const pending = topic.publishStatus === "PENDING"
              const rejected = topic.publishStatus === "REJECTED"
              const busy = busyId === topic._id

              return (
                <li key={topic._id} className="border-b border-line py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold">{topic.title}</h3>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
                        <span>{topic.category}</span>
                        <DifficultyMark level={topic.difficulty} />
                        <TopicBadge topic={topic} />
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm font-semibold">
                      <Link
                        to={`/topics/${topic._id}/explain`}
                        className="underline"
                      >
                        Study
                      </Link>
                      <button
                        type="button"
                        aria-label={`Edit ${topic.title}`}
                        disabled={pending}
                        onClick={() => startEdit(topic)}
                        className="underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
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

                  {rejected && (
                    <p className="mt-3 rounded-md bg-flag-wash px-3.5 py-3 text-sm text-flag">
                      The admin did not publish this topic
                      {topic.rejectionReason
                        ? `: ${topic.rejectionReason}`
                        : "."}{" "}
                      You can edit it and suggest it again.
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {pending ? (
                      <>
                        <span className="text-sm text-ink-soft">
                          Waiting for an admin to review it.
                        </span>
                        <Button
                          size="sm"
                          variant="quiet"
                          loading={busy}
                          loadingText="Cancelling..."
                          onClick={() => handleCancel(topic)}
                        >
                          Cancel request
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="quiet"
                        loading={busy}
                        loadingText="Sending..."
                        onClick={() => handleSuggest(topic)}
                      >
                        {rejected ? "Suggest again" : "Suggest to everyone"}
                      </Button>
                    )}
                  </div>

                  {confirmId === topic._id && (
                    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-md bg-flag-wash px-3.5 py-3 text-sm">
                      <span>
                        Delete this topic? Your past work on it stays in History
                        as "Deleted topic".
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleDelete(topic)}
                        loading={busy}
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
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}