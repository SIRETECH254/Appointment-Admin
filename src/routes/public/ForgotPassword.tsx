import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

type InlineMessage = {
  type: 'success' | 'error'
  text: string
}

// Forgot password page: requests reset link by email.
const ForgotPassword = () => {
  const { forgotPassword, error, clearError } = useAuth()
  // Single form object to send as payload.
  const [form, setForm] = useState({ email: '' })
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(
    null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Shared input handler for all fields.
  const handleInputChange = useCallback(
    (name: keyof typeof form, value: string) => {
      // Update form and clear any errors.
      setForm((previous) => ({ ...previous, [name]: value }))
      if (error) {
        clearError()
      }
      setInlineMessage(null)
    },
    [error, clearError],
  )

  // Derived flag for button disabled state.
  const canSubmit = useMemo(
    () => Boolean(form.email.trim()) && !isSubmitting,
    [form.email, isSubmitting],
  )

  // Submit handler: validate email and call forgotPassword.
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const trimmedEmail = form.email.trim()

      if (!trimmedEmail) {
        setInlineMessage({
          type: 'error',
          text: 'Please enter your email address.',
        })
        return
      }

      setInlineMessage(null)
      setIsSubmitting(true)

      try {
        // Send the form object as the payload source.
        const result = await forgotPassword(trimmedEmail)
        if (!result.success) {
          setInlineMessage({
            type: 'error',
            text: result.error ?? 'Unable to send reset link.',
          })
          return
        }

        setInlineMessage({
          type: 'success',
          text: 'Check your inbox for password reset instructions.',
        })
      } catch {
        setInlineMessage({
          type: 'error',
          text: 'Unexpected error. Please try again.',
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [form.email, forgotPassword],
  )

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Appointment Admin
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Forgot password?
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Enter your email address and we will send reset instructions.
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {/* Email field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                value={form.email}
                onChange={(event) =>
                  handleInputChange('email', event.target.value)
                }
                autoCapitalize="none"
                autoComplete="email"
                type="email"
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
              />
            </div>

            {/* Inline feedback */}
            {inlineMessage ? (
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  inlineMessage.type === 'success'
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {inlineMessage.text}
              </div>
            ) : null}

            {/* Submit button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-[#D4AF37] py-3 text-sm font-semibold text-white transition hover:bg-[#C5A028] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Remembered your password?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#C5A028] transition hover:text-[#B08C22]"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
