import { useCallback, useMemo, useState } from 'react'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useChangePassword } from '../../../tanstack/useUsers'

type InlineMessage = {
  type: 'success' | 'error'
  text: string
}

const ProfileChangePassword = () => {
  // Change password mutation hook.
  const changePassword = useChangePassword()
  // Single form object to keep password fields in sync.
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  // Visibility toggles for each password field.
  const [isCurrentVisible, setIsCurrentVisible] = useState(false)
  const [isNewVisible, setIsNewVisible] = useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState(false)
  // Inline feedback for success/error messages.
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(
    null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Shared input handler: update form values and clear messages.
  const handleInputChange = useCallback(
    (name: keyof typeof form, value: string) => {
      setForm((previous) => ({ ...previous, [name]: value }))
      setInlineMessage(null)
    },
    [],
  )

  // Derived flag to keep the submit button state accurate.
  const canSubmit = useMemo(() => {
    return (
      Boolean(
        form.currentPassword && form.newPassword && form.confirmPassword,
      ) &&
      form.newPassword === form.confirmPassword &&
      !isSubmitting
    )
  }, [
    form.currentPassword,
    form.newPassword,
    form.confirmPassword,
    isSubmitting,
  ])

  // Submit handler: validates inputs and triggers the mutation.
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (
        !form.currentPassword ||
        !form.newPassword ||
        !form.confirmPassword
      ) {
        setInlineMessage({
          type: 'error',
          text: 'Please fill out all password fields.',
        })
        return
      }

      if (form.newPassword !== form.confirmPassword) {
        setInlineMessage({
          type: 'error',
          text: 'New password and confirmation do not match.',
        })
        return
      }

      setInlineMessage(null)
      setIsSubmitting(true)

      try {
        // Send the current + new password payload to the API.
        await changePassword.mutateAsync({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        })
        // Reset the form so credentials are not left in memory.
        setInlineMessage({
          type: 'success',
          text: 'Password updated successfully.',
        })
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } catch (submitError: any) {
        const errorMessage =
          submitError?.response?.data?.message ||
          'Unable to change password.'
        setInlineMessage({ type: 'error', text: errorMessage })
      } finally {
        setIsSubmitting(false)
      }
    },
    [form, changePassword],
  )

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="">
          {/* Header */}
          <div className="auth-header">
            <p className="auth-kicker">Appointment Admin</p>
            <h1 className="auth-title">Change password</h1>
            <p className="auth-subtitle">
              Update your password to keep your account secure.
            </p>
          </div>

          {/* Change password form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Stack the three password inputs */}
            <div className="space-y-4">
              {/* Current password */}
              <div className="auth-field">
                {/* Field label */}
                <label className="label">Current password</label>
                <div className="relative">
                  <input
                    value={form.currentPassword}
                    onChange={(event) =>
                      handleInputChange('currentPassword', event.target.value)
                    }
                    type={isCurrentVisible ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="input-password"
                    placeholder="••••••••"
                  />
                  {/* Show/hide toggle */}
                  <button
                    type="button"
                    onClick={() => setIsCurrentVisible((prev) => !prev)}
                    aria-label={
                      isCurrentVisible ? 'Hide password' : 'Show password'
                    }
                    className="input-toggle-icon"
                  >
                    {isCurrentVisible ? (
                      <MdVisibilityOff size={20} />
                    ) : (
                      <MdVisibility size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div className="auth-field">
                {/* Field label */}
                <label className="label">New password</label>
                <div className="relative">
                  <input
                    value={form.newPassword}
                    onChange={(event) =>
                      handleInputChange('newPassword', event.target.value)
                    }
                    type={isNewVisible ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="input-password"
                    placeholder="••••••••"
                  />
                  {/* Show/hide toggle */}
                  <button
                    type="button"
                    onClick={() => setIsNewVisible((prev) => !prev)}
                    aria-label={
                      isNewVisible ? 'Hide password' : 'Show password'
                    }
                    className="input-toggle-icon"
                  >
                    {isNewVisible ? (
                      <MdVisibilityOff size={20} />
                    ) : (
                      <MdVisibility size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm new password */}
              <div className="auth-field">
                {/* Field label */}
                <label className="label">Confirm new password</label>
                <div className="relative">
                  <input
                    value={form.confirmPassword}
                    onChange={(event) =>
                      handleInputChange('confirmPassword', event.target.value)
                    }
                    type={isConfirmVisible ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="input-password"
                    placeholder="••••••••"
                  />
                  {/* Show/hide toggle */}
                  <button
                    type="button"
                    onClick={() => setIsConfirmVisible((prev) => !prev)}
                    aria-label={
                      isConfirmVisible ? 'Hide password' : 'Show password'
                    }
                    className="input-toggle-icon"
                  >
                    {isConfirmVisible ? (
                      <MdVisibilityOff size={20} />
                    ) : (
                      <MdVisibility size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Inline feedback after submit */}
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

            {/* Submit action */}
            <button
              type="submit"
              disabled={!canSubmit || changePassword.isPending}
              className="auth-button"
            >
              {isSubmitting || changePassword.isPending
                ? 'Updating...'
                : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileChangePassword
