import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useGetProfile } from '../../../tanstack/useUsers'

// Format ISO timestamps into a human-friendly label for the profile summary.
const formatDateTime = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const Profile = () => {
  // Pull cached auth user for fast initial render while the query resolves.
  const { user } = useAuth()
  // Source of truth for the profile payload (query + status flags).
  const { data, isLoading, isError, error } = useGetProfile()

  // Normalize API responses that may return { user } or a direct user object.
  const profile = (data as any)?.user ?? data ?? user
  // Prefer API-provided message if the profile fetch fails.
  const errorMessage =
    (error as any)?.response?.data?.message || 'Unable to load profile.'

  // Build initials for the avatar fallback when no image is available.
  const initials = useMemo(() => {
    const source = profile ?? user
    if (!source) return 'U'
    const letters = [source.firstName, source.lastName]
      .filter(Boolean)
      .map((value: string) => value[0]?.toUpperCase())
      .join('')
    return letters || 'U'
  }, [profile, user])

  // Resolve the most relevant role label for the header pill.
  const roleLabel = useMemo(() => {
    const roles = profile?.roles ?? user?.roles
    if (!roles?.length) return 'User'
    return roles[0].displayName ?? roles[0].name ?? 'User'
  }, [profile, user])

  // Block rendering the card layout until we have at least cached user data.
  if (isLoading && !profile) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-slate-500">
        Loading profile...
      </div>
    )
  }

  return (
    // Page wrapper: keep consistent vertical spacing between cards.
    <div className="space-y-6">
      {/* Profile header card: avatar, identity, and primary actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Layout: stack on mobile, align items side-by-side on desktop */}
        <div className="flex flex-col  gap-6 items-center justify-center">
          {/* Identity block: avatar + name + metadata */}
          <div className="flex items-center gap-4">
            {profile?.avatar ? (
              // Server-hosted avatar image when available.
              <img
                src={profile.avatar}
                alt={`${profile.firstName ?? 'User'} avatar`}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              // Initials badge fallback when avatar is missing.
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-xl font-semibold text-white">
                {initials}
              </div>
            )}
            <div>
              {/* Primary identity label */}
              <h1 className="text-xl font-semibold text-gray-900">
                {profile?.firstName ?? 'User'} {profile?.lastName ?? ''}
              </h1>
              {/* Secondary identity label (email) */}
              <p className="text-sm text-gray-500">{profile?.email ?? '—'}</p>
              {/* Role + status pills */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {/* Role pill shows first available role */}
                <span className="badge badge-soft">{roleLabel}</span>
                {/* Status pill driven by isActive flag */}
                <span
                  className={
                    profile?.isActive
                      ? 'badge badge-success'
                      : 'badge badge-error'
                  }
                >
                  {profile?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* CTA block: edit and change password actions */}
          <div className="flex flex-wrap gap-3">
            {/* Primary CTA: navigate to edit form */}
            <Link to="/profile/edit" className="btn-primary">
              Edit Profile
            </Link>
            {/* Secondary CTA: change password flow */}
            <Link
              to="/profile/change-password"
              className="btn-secondary"
            >
              Change Password
            </Link>
          </div>
        </div>
      </div>

      {/* Surface API errors inline without hiding cached data */}
      {isError ? (
        <div className="alert-error">{errorMessage}</div>
      ) : null}

      {/* Profile details card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Section title */}
        <h2 className="text-lg font-semibold text-gray-900">
          Profile details
        </h2>
        {/* Two-column grid on desktop for compact layout */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            {/* Phone label + value */}
            <p className="text-xs uppercase text-gray-400">Phone</p>
            <p className="text-sm text-gray-700">
              {profile?.phone || '—'}
            </p>
          </div>
          <div>
            {/* Email label + value */}
            <p className="text-xs uppercase text-gray-400">Email</p>
            <p className="text-sm text-gray-700">
              {profile?.email || '—'}
            </p>
          </div>
          <div>
            {/* Account creation timestamp */}
            <p className="text-xs uppercase text-gray-400">Created</p>
            <p className="text-sm text-gray-700">
              {formatDateTime(profile?.createdAt)}
            </p>
          </div>
          <div>
            {/* Last update timestamp */}
            <p className="text-xs uppercase text-gray-400">Last updated</p>
            <p className="text-sm text-gray-700">
              {formatDateTime(profile?.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
