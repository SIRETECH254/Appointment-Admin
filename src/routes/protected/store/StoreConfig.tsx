import { Link } from 'react-router-dom'
import { useGetStoreConfiguration } from '../../../tanstack/useStoreConfig'
import {
  formatDateTime,
  formatMinutes,
  formatReminderTimes,
} from '../../../utils/storeConfigUtils'

const StoreConfig = () => {
  // Fetch store configuration data
  const { data, isLoading, isError, error } = useGetStoreConfiguration()

  // Extract storeConfiguration from API response
  const storeConfig = (data as any)?.storeConfiguration ?? data

  // Get error message from API response
  const errorMessage =
    (error as any)?.response?.data?.message || 'Unable to load store configuration.'

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-slate-500">
        Loading store configuration...
      </div>
    )
  }

  return (
    // Page wrapper: keep consistent vertical spacing between cards
    <div className="space-y-6">
      {/* Store configuration header card: icon, title, and primary action */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Layout: stack on mobile, align items side-by-side on desktop */}
        <div className="flex flex-col gap-6 items-center justify-center">
          {/* Identity block: icon + title */}
          <div className="flex items-center gap-4">
            {/* Store icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-2xl">
              🏪
            </div>
            <div>
              {/* Primary title */}
              <h1 className="text-xl font-semibold text-gray-900">
                Store Configuration
              </h1>
              {/* Secondary description */}
              <p className="text-sm text-gray-500">
                Manage your store settings and policies
              </p>
            </div>
          </div>

          {/* CTA block: edit action */}
          <div className="flex flex-wrap gap-3">
            {/* Primary CTA: navigate to edit form */}
            <Link to="/store/edit" className="btn-primary">
              Edit Configuration
            </Link>
          </div>
        </div>
      </div>

      {/* Surface API errors inline */}
      {isError ? (
        <div className="alert-error">{errorMessage}</div>
      ) : null}

      {/* Store configuration details card */}
      {storeConfig && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* Section title */}
          <h2 className="text-lg font-semibold text-gray-900">
            Configuration Details
          </h2>
          {/* Two-column grid on desktop for compact layout */}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Appointment Fee Section */}
            <div>
              <p className="text-xs uppercase text-gray-400">Appointment Fee Type</p>
              <p className="text-sm text-gray-700">
                {storeConfig.appointmentFeeType
                  ? storeConfig.appointmentFeeType.toUpperCase()
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Appointment Fee Value</p>
              <p className="text-sm text-gray-700">
                {storeConfig.appointmentFeeValue !== undefined
                  ? `${storeConfig.appointmentFeeValue} ${storeConfig.currency || 'KES'}`
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Currency</p>
              <p className="text-sm text-gray-700">
                {storeConfig.currency || '—'}
              </p>
            </div>

            {/* Booking Settings Section */}
            <div>
              <p className="text-xs uppercase text-gray-400">Min Booking Notice</p>
              <p className="text-sm text-gray-700">
                {storeConfig.minBookingNotice !== undefined
                  ? formatMinutes(storeConfig.minBookingNotice)
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Late Grace Period</p>
              <p className="text-sm text-gray-700">
                {storeConfig.lateGracePeriod !== undefined
                  ? formatMinutes(storeConfig.lateGracePeriod)
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Allow Walk-ins</p>
              <p className="text-sm text-gray-700">
                {storeConfig.allowWalkIns !== undefined ? (
                  <span
                    className={
                      storeConfig.allowWalkIns
                        ? 'badge badge-success'
                        : 'badge badge-error'
                    }
                  >
                    {storeConfig.allowWalkIns ? 'Yes' : 'No'}
                  </span>
                ) : (
                  '—'
                )}
              </p>
            </div>

            {/* Notification Settings Section */}
            {storeConfig.notificationSettings && (
              <>
                <div>
                  <p className="text-xs uppercase text-gray-400">Send SMS</p>
                  <p className="text-sm text-gray-700">
                    <span
                      className={
                        storeConfig.notificationSettings.sendSMS
                          ? 'badge badge-success'
                          : 'badge badge-error'
                      }
                    >
                      {storeConfig.notificationSettings.sendSMS ? 'Enabled' : 'Disabled'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400">Send Email</p>
                  <p className="text-sm text-gray-700">
                    <span
                      className={
                        storeConfig.notificationSettings.sendEmail
                          ? 'badge badge-success'
                          : 'badge badge-error'
                      }
                    >
                      {storeConfig.notificationSettings.sendEmail ? 'Enabled' : 'Disabled'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400">Send Push</p>
                  <p className="text-sm text-gray-700">
                    <span
                      className={
                        storeConfig.notificationSettings.sendPush
                          ? 'badge badge-success'
                          : 'badge badge-error'
                      }
                    >
                      {storeConfig.notificationSettings.sendPush ? 'Enabled' : 'Disabled'}
                    </span>
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs uppercase text-gray-400">Reminder Times</p>
                  <p className="text-sm text-gray-700">
                    {storeConfig.notificationSettings.reminderTimes
                      ? formatReminderTimes(storeConfig.notificationSettings.reminderTimes)
                      : '—'}
                  </p>
                </div>
              </>
            )}

            {/* Business Settings Section */}
            <div>
              <p className="text-xs uppercase text-gray-400">Timezone</p>
              <p className="text-sm text-gray-700">
                {storeConfig.businessHoursTimezone || '—'}
              </p>
            </div>

            {/* Timestamps Section */}
            <div>
              <p className="text-xs uppercase text-gray-400">Created</p>
              <p className="text-sm text-gray-700">
                {formatDateTime(storeConfig.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Last Updated</p>
              <p className="text-sm text-gray-700">
                {formatDateTime(storeConfig.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StoreConfig

