import { useCallback, useEffect, useState } from "react"
import Button from "../components/Button"
import DifficultyMark from "../components/DifficultyMark"
import { apiError } from "../service/errors"
import {
  approveTopic,
  getPublishRequests,
  rejectTopic
} from "../service/topic"
import type { TopicRequest } from "../types/topic"

export default function AdminRequests() {
  const [requests, setRequests] = useState<TopicRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [notice, setNotice] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  // the request whose "reject" form is open, and the reason typed so far
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState("")

  const load = useCallback(async () => {
    try {
      setRequests(await getPublishRequests())
      setLoadError(null)
    } catch (err) {
      setLoadError(apiError(err, "Could not load requests."))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const run = async (
    req: TopicRequest,
    action: () => Promise<unknown>,
    success: string,
    failure: string
  ) => {
    setActionError(null)
    setNotice(null)
    setBusyId(req._id)
    try {
      await action()
      setNotice(success)
      setRejectingId(null)
      setReason("")
      await load()
    } catch (err) {
      setActionError(apiError(err, failure))
    } finally {
      setBusyId(null)
    }
  }

  const handleApprove = (req: TopicRequest) =>
    run(
      req,
      () => approveTopic(req._id),
      `${req.title} is now public.`,
      "Could not approve the topic."
    )

  const handleReject = (req: TopicRequest) =>
    run(
      req,
      () => rejectTopic(req._id, reason.trim()),
      `Rejected ${req.title}.`,
      "Could not reject the topic."
    )

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">Topic requests</h1>
      <p className="mt-3 max-w-2xl font-serif text-xl leading-relaxed text-ink-soft">
        Learners suggest their private topics here. Approve the good ones and
        everyone can study them.
      </p>

      <div role="status" aria-live="polite" className="mt-4 min-h-12">
        {notice && (
          <p className="rounded-md bg-good-wash px-3.5 py-3 text-sm font-semibold text-good">
            {notice}
          </p>
        )}
      </div>

      {actionError && (
        <p
          role="alert"
          className="mb-3 rounded-md bg-flag-wash px-3.5 py-3 text-sm text-flag"
        >
          {actionError}
        </p>
      )}

      {loading && <p className="text-ink-soft">Loading requests...</p>}

      {loadError && (
        <p role="alert" className="rounded-md bg-flag-wash px-3.5 py-3 text-flag">
          {loadError}
        </p>
      )}

      {!loading && !loadError && requests.length === 0 && (
        <p className="py-4 text-ink-soft">No requests waiting. All caught up.</p>
      )}

      <ul className="border-t border-line">
        {requests.map((req) => {
          const busy = busyId === req._id

          return (
            <li key={req._id} className="border-b border-line py-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold">{req.title}</h2>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
                    <span>{req.category}</span>
                    <DifficultyMark level={req.difficulty} />
                    <span>by {req.createdBy?.name ?? "a deleted user"}</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    size="sm"
                    loading={busy && rejectingId !== req._id}
                    loadingText="Approving..."
                    disabled={busy}
                    onClick={() => handleApprove(req)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="quiet"
                    disabled={busy}
                    onClick={() => {
                      setRejectingId(req._id)
                      setReason("")
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>

              {/* whitespace-pre-wrap keeps the learner's line breaks; React escapes the text */}
              <p className="mt-3 whitespace-pre-wrap font-serif text-ink-soft">
                {req.description}
              </p>

              {rejectingId === req._id && (
                <div className="mt-4 space-y-3 rounded-md bg-flag-wash px-3.5 py-3">
                  <label
                    htmlFor={`reason-${req._id}`}
                    className="block text-sm font-semibold"
                  >
                    Reason (optional, the learner will see it)
                  </label>
                  <textarea
                    id={`reason-${req._id}`}
                    rows={2}
                    maxLength={300}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-md border border-line bg-sheet px-3 py-2 text-base focus:border-ink"
                  />
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      loading={busy}
                      loadingText="Rejecting..."
                      onClick={() => handleReject(req)}
                    >
                      Confirm reject
                    </Button>
                    <Button
                      size="sm"
                      variant="quiet"
                      disabled={busy}
                      onClick={() => setRejectingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}