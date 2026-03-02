import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useAppDispatch } from '../../../redux/hooks'
import { updateUser } from '../../../redux/slices/authSlice'
import type { User } from '../../../redux/types'
import { useGetProfile, useUpdateProfile } from '../../../tanstack/useUsers'

type InlineMessage = {
  type: 'success' | 'error'
  text: string
}

const ProfileEdit = () => {
  // Routing + state helpers.
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  // Cached auth user for immediate UI while the query hydrates.
  const { user } = useAuth()
  // Profile query + mutation hooks.
  const { data, isLoading } = useGetProfile()
  const updateProfile = useUpdateProfile()

  // Normalize API response shapes to a single profile object.
  const profile = (data as any)?.user ?? data ?? user
  // Form field state.
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  // Avatar state: preview URL, selected file, and removal flag.
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarRemoved, setAvatarRemoved] = useState(false)
  // Inline feedback for form actions.
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Refs for hidden file input and cleanup tasks.
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const redirectTimer = useRef<number | null>(null)

  // Hydrate form state from the profile payload.
  useEffect(() => {
    if (!profile) return
    setFirstName(profile.firstName ?? '')
    setLastName(profile.lastName ?? '')
    setEmail(profile.email ?? '')
    setPhone(profile.phone ?? '')
    if (!avatarFile && !avatarRemoved) {
      setAvatarPreview(profile.avatar ?? null)
    }
  }, [profile, avatarFile, avatarRemoved])

  // Cleanup: revoke object URLs and cancel delayed navigation on unmount.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
      if (redirectTimer.current) {
        window.clearTimeout(redirectTimer.current)
      }
    }
  }, [])

  // Initials fallback for avatar placeholder.
  const initials = useMemo(() => {
    const source = profile ?? user
    if (!source) return 'U'
    const letters = [source.firstName, source.lastName]
      .filter(Boolean)
      .map((value: string) => value[0]?.toUpperCase())
      .join('')
    return letters || 'U'
  }, [profile, user])

  // Disable submit if required fields are empty or already submitting.
  const canSubmit = useMemo(() => {
    return Boolean(firstName.trim() && lastName.trim()) && !isSubmitting
  }, [firstName, lastName, isSubmitting])

  // Handle avatar selection and preview creation.
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return
      // Revoke any previous preview URL to avoid memory leaks.
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
      const previewUrl = URL.createObjectURL(file)
      objectUrlRef.current = previewUrl
      setAvatarPreview(previewUrl)
      setAvatarFile(file)
      setAvatarRemoved(false)
      setInlineMessage(null)
    },
    [],
  )

  // Remove avatar and mark for null payload on submit.
  const handleRemoveAvatar = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setAvatarPreview(null)
    setAvatarFile(null)
    setAvatarRemoved(true)
    setInlineMessage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Validate fields, build payload, and submit profile changes.
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const trimmedFirstName = firstName.trim()
      const trimmedLastName = lastName.trim()
      const trimmedPhone = phone.trim()

      if (!trimmedFirstName || !trimmedLastName) {
        setInlineMessage({
          type: 'error',
          text: 'First name and last name are required.',
        })
        return
      }

      setInlineMessage(null)
      setIsSubmitting(true)

      try {
        let payload: any

        // If an avatar file was selected, submit a multipart payload.
        if (avatarFile) {
          const formData = new FormData()
          formData.append('firstName', trimmedFirstName)
          formData.append('lastName', trimmedLastName)
          if (trimmedPhone) {
            formData.append('phone', trimmedPhone)
          }
          formData.append('avatar', avatarFile)
          payload = formData
        } else {
          // Otherwise, send a JSON payload and optionally remove the avatar.
          payload = {
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            phone: trimmedPhone || undefined,
          }
          if (avatarRemoved) {
            payload.avatar = null
          }
        }

        // Persist the update and normalize API response shapes.
        const result = await updateProfile.mutateAsync(payload)
        const updatedUser = (result as any)?.user ?? result

        // Keep auth state + localStorage in sync for navbar/header usage.
        if (updatedUser) {
          localStorage.setItem('user', JSON.stringify(updatedUser))
          dispatch(updateUser(updatedUser as User))
        }

        // Show success feedback and navigate back to overview.
        setInlineMessage({
          type: 'success',
          text: 'Profile updated successfully.',
        })

        redirectTimer.current = window.setTimeout(() => {
          navigate('/profile', { replace: true })
        }, 1200)
      } catch (submitError: any) {
        const errorMessage =
          submitError?.response?.data?.message ||
          'Unable to update profile.'
        setInlineMessage({ type: 'error', text: errorMessage })
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      firstName,
      lastName,
      phone,
      avatarFile,
      avatarRemoved,
      updateProfile,
      dispatch,
      navigate,
    ],
  )

  return (
    // Page wrapper: keep consistent spacing between the header and form.
    <div className="space-y-6">
      {/* Header card: avatar preview + explanation + avatar actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Responsive layout: stack on mobile, align on desktop */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Avatar + title block */}
          <div className="flex items-center gap-4">
            {avatarPreview ? (
              // Local preview of the selected avatar file.
              <img
                src={avatarPreview}
                alt="Profile avatar preview"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              // Initials placeholder when no avatar exists.
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-xl font-semibold text-white">
                {initials}
              </div>
            )}
            <div>
              {/* Page title */}
              <h1 className="text-xl font-semibold text-gray-900">
                Edit profile
              </h1>
              {/* Supporting hint to guide the user */}
              <p className="text-sm text-gray-500">
                Keep your contact information up to date.
              </p>
            </div>
          </div>

          {/* Avatar action buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Trigger the hidden file input */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary"
            >
              Upload avatar
            </button>
            {/* Remove avatar (disabled when there is no preview) */}
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={!avatarPreview}
              className="btn-ghost btn-sm text-gray-500"
            >
              Remove avatar
            </button>
            {/* Hidden file input to keep visual controls consistent */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Edit profile form */}
      <form
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        {/* Main profile fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="auth-field">
            {/* First name input */}
            <label className="label">First name</label>
            <input
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="First name"
              className="input"
            />
          </div>
          <div className="auth-field">
            {/* Last name input */}
            <label className="label">Last name</label>
            <input
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Last name"
              className="input"
            />
          </div>
          <div className="auth-field">
            {/* Email is read-only to avoid accidental account changes */}
            <label className="label">Email</label>
            <input
              value={email}
              disabled
              className="input-disabled"
            />
          </div>
          <div className="auth-field">
            {/* Optional phone number */}
            <label className="label">Phone</label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Phone number"
              className="input"
            />
          </div>
        </div>

        {/* Inline success/error feedback */}
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

        {/* Form actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {/* Cancel returns to the profile overview */}
          <Link to="/profile" className="btn-secondary">
            Cancel
          </Link>
          {/* Save changes button reflects loading state */}
          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="btn-primary"
          >
            {isSubmitting || updateProfile.isPending
              ? 'Saving...'
              : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfileEdit
