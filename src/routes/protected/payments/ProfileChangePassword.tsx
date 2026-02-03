import { useCallback, useMemo, useState } from 'react'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useChangePassword } from '../../../tanstack/useUsers'

type InlineMessage = {
  type: 'success' | 'error'
  text: string
}

const ProfileChangePassword = () => {
  const changePassword = useChangePassword()
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isCurrentVisible, setIsCurrentVisible] = useState(false)
  const [isNewVisible, setIsNewVisible] = useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState(false)
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(
    null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = useCallback(
    (name: keyof typeof form, value: string) => {
      setForm((previous) => ({ ...previous, [name]: value }))
      setInlineMessage(null)
    },
    [],
  )

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
        await changePassword.mutateAsync({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        })
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
        <div className="w-full max-w-2xl space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-semibold text-gray-900">
              Change password
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Update your password to keep your account secure.
            </p>
          </div>

          <form
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              <div className="auth-field">
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

              <div className="auth-field">
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

              <div className="auth-field">
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

            {inlineMessage ? (
              <div
                className={
                  inlineMessage.type === 'success'
                    ? 'alert-success mt-4'
                    : 'alert-error mt-4'
                }
              >
                {inlineMessage.text}
              </div>
            ) : null}

            <div className="mt-6">
              <button
                type="submit"
                disabled={!canSubmit || changePassword.isPending}
                className="btn-primary"
              >
                {isSubmitting || changePassword.isPending
                  ? 'Updating...'
                  : 'Update password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileChangePassword
