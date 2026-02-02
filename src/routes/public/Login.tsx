import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useAuth } from '../../contexts/AuthContext'

// Login page: handles credentials input and sign-in flow.
const Login = () => {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuth()

  // Single form object to send as the login payload.
  const [form, setForm] = useState({ email: '', password: '' })
  const [rememberMe, setRememberMe] = useState(true)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)

  // Shared input handler for all fields.
  const handleInputChange = useCallback(
    (name: keyof typeof form, value: string) => {
      // Update the form and clear any visible errors.
      setForm((previous) => ({ ...previous, [name]: value }))
      if (error) {
        clearError()
      }
      setInlineError(null)
    },
    [error, clearError],
  )

  // Derived flag for button state and validation.
  const canSubmit = useMemo(
    () =>
      Boolean(form.email.trim() && form.password) &&
      !isSubmitting &&
      !isLoading,
    [form.email, form.password, isSubmitting, isLoading],
  )

  // Form submission handler (validates + calls login).
  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      // Trim email before sending to the API.
      const trimmedEmail = form.email.trim()
      if (!trimmedEmail || !form.password) {
        setInlineError('Please enter both email and password.')
        return
      }

      // Clear old errors and start the button loader.
      setInlineError(null)
      setIsSubmitting(true)

      try {
        // Send the form object as the login payload.
        const result = await login({ ...form, email: trimmedEmail })
        if (!result.success) {
          setInlineError(result.error ?? 'Unable to sign in.')
          return
        }

        // If remember me is unchecked, drop the refresh token.
        if (!rememberMe) {
          localStorage.removeItem('refreshToken')
        }

        // Redirect to the authenticated landing page.
        navigate('/dashboard', { replace: true })
      } finally {
        // Always stop the loader.
        setIsSubmitting(false)
      }
    },
    [form, rememberMe, login, navigate],
  )

  // Prefer inline error over global auth error for display.
  const bannerMessage = inlineError || error

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
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to manage appointments and staff schedules.
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
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

            {/* Password field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  value={form.password}
                  onChange={(event) =>
                    handleInputChange('password', event.target.value)
                  }
                  autoComplete="current-password"
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

            {/* Remember me + forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => {
                    // Checkbox is separate from the form object but still clears errors.
                    setRememberMe((previous) => !previous)
                    setInlineError(null)
                    if (error) {
                      clearError()
                    }
                  }}
                  className="h-4 w-4 accent-[#D4AF37]"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="font-semibold text-[#C5A028] transition hover:text-[#B08C22]"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error banner */}
            {bannerMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {bannerMessage}
              </div>
            ) : null}

            {/* Button-only loading state */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-[#D4AF37] py-3 text-sm font-semibold text-white transition hover:bg-[#C5A028] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting || isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Footer copy */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Need access?{' '}
            <span className="font-semibold text-slate-700">
              Contact your administrator
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
