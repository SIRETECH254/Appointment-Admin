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
    <div className="auth-page">
      <div className="auth-container">
        <div className="">
          {/* Header */}
          <div className="auth-header">
            <p className="auth-kicker">
              Appointment Admin
            </p>
            <h1 className="auth-title">
              Reset password
            </h1>
            <p className="auth-subtitle">
              Set a new password for your account.
            </p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* New password field */}
            <div className="auth-field">
              <label className="form-label">
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
                  className="form-input-password"
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
                  className="form-toggle-icon"
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
            <div className="auth-field">
              <label className="form-label">
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
                  className="form-input-password"
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
                  className="form-toggle-icon"
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
                className={
                  inlineMessage.type === 'success'
                    ? 'auth-inline-message-success'
                    : 'auth-inline-message-error'
                }
              >
                {inlineMessage.text}
              </div>
            ) : null}

            {/* Submit button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="auth-button"
            >
              {isSubmitting ? 'Updating...' : 'Update password'}
            </button>
          </form>

          {/* Footer */}
          <p className="auth-footer">
            Need to try again?{' '}
            <Link
              to="/login"
              className="auth-link"
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
