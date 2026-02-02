import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useAuth } from '../../contexts/AuthContext'

type InlineMessage = {
  type: 'success' | 'error'
  text: string
}

// Reset password page: validates token + new password.
const ResetPassword = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { resetPassword, error, clearError } = useAuth()

  // Single form object to drive the payload and validations.
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(
    null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const redirectTimer = useRef<number | null>(null)

  // Clean up the delayed redirect on unmount.
  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        window.clearTimeout(redirectTimer.current)
      }
    }
  }, [])

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

  // Derived flag for button disabled state and validation.
  const canSubmit = useMemo(
    () =>
      Boolean(token && form.password && form.confirmPassword) &&
      !isSubmitting &&
      form.password === form.confirmPassword,
    [token, form.password, form.confirmPassword, isSubmitting],
  )

  // Submit handler: validate token + password fields then call resetPassword.
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      // Ensure token is present in the URL.
      if (!token) {
        setInlineMessage({
          type: 'error',
          text: 'Reset link is missing or invalid.',
        })
        return
      }

      // Require both password fields.
      if (!form.password || !form.confirmPassword) {
        setInlineMessage({
          type: 'error',
          text: 'Enter and confirm your new password.',
        })
        return
      }

      // Block submission if passwords do not match.
      if (form.password !== form.confirmPassword) {
        setInlineMessage({
          type: 'error',
          text: 'Passwords do not match.',
        })
        return
      }

      // Clear old messages and start the loader.
      setInlineMessage(null)
      setIsSubmitting(true)

      try {
        // Send the form-derived password as the payload source.
        const result = await resetPassword(token, form.password)
        if (!result.success) {
          setInlineMessage({
            type: 'error',
            text: result.error ?? 'Unable to reset password.',
          })
          return
        }

        setInlineMessage({
          type: 'success',
          text: 'Password updated! Redirecting to sign in…',
        })

        // Delay navigation to let the user read the success message.
        redirectTimer.current = window.setTimeout(() => {
          navigate('/login', { replace: true })
        }, 1500)
      } catch {
        setInlineMessage({
          type: 'error',
          text: 'Unexpected error. Please try again.',
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [token, form.password, form.confirmPassword, resetPassword, navigate],
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
              Reset password
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Set a new password for your account.
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {/* New password field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                New password
              </label>
              <div className="relative">
                <input
                  value={form.password}
                  onChange={(event) =>
                    handleInputChange('password', event.target.value)
                  }
                  autoComplete="new-password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                />
                {/* Toggle password visibility */}
                <button
                  type="button"
                  onClick={() =>
                    setIsPasswordVisible((previous) => !previous)
                  }
                  aria-label={
                    isPasswordVisible ? 'Hide password' : 'Show password'
                  }
                  className="absolute right-3 top-3 text-slate-400 transition hover:text-slate-600"
                >
                  {isPasswordVisible ? (
                    <MdVisibilityOff size={20} />
                  ) : (
                    <MdVisibility size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Confirm password
              </label>
              <div className="relative">
                <input
                  value={form.confirmPassword}
                  onChange={(event) =>
                    handleInputChange('confirmPassword', event.target.value)
                  }
                  autoComplete="new-password"
                  type={isConfirmPasswordVisible ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                />
                {/* Toggle confirm password visibility */}
                <button
                  type="button"
                  onClick={() =>
                    setIsConfirmPasswordVisible((previous) => !previous)
                  }
                  aria-label={
                    isConfirmPasswordVisible
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                  className="absolute right-3 top-3 text-slate-400 transition hover:text-slate-600"
                >
                  {isConfirmPasswordVisible ? (
                    <MdVisibilityOff size={20} />
                  ) : (
                    <MdVisibility size={20} />
                  )}
                </button>
              </div>
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
              {isSubmitting ? 'Updating...' : 'Update password'}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Need to try again?{' '}
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

export default ResetPassword
