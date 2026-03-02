import { Link } from 'react-router-dom'
import { FiDollarSign, FiClock, FiUserPlus, FiSmartphone, FiMail, FiBell, FiGlobe, FiCalendar, FiSettings } from 'react-icons/fi'
import { useGetStoreConfiguration } from '../../../tanstack/useStoreConfig'
import StatusBadge from '../../../components/ui/StatusBadge'
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
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="flex flex-col gap-6 items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-300" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-300 rounded" />
                <div className="h-4 w-64 bg-gray-300 rounded" />
              </div>
            </div>
            <div className="h-10 w-32 bg-gray-300 rounded" />
          </div>
        </div>
        {/* Details skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-40 bg-gray-300 rounded mb-4" />
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 bg-gray-300 rounded" />
                <div className="h-4 w-48 bg-gray-300 rounded" />
              </div>
            ))}
          </div>
        </div>
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

      {/* Store configuration details */}
      {storeConfig && (
        <div className="space-y-6">
          {/* Appointment Settings Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FiDollarSign className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Appointment Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FiSettings className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase text-gray-400 mb-1">Appointment Fee Type</p>
                  <p className="text-sm text-gray-700">
                    {storeConfig.appointmentFeeType
                      ? storeConfig.appointmentFeeType.toUpperCase()
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiDollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase text-gray-400 mb-1">Appointment Fee Value</p>
                  <p className="text-sm text-gray-700">
                    {storeConfig.appointmentFeeValue !== undefined
                      ? `${storeConfig.appointmentFeeValue} ${storeConfig.currency || 'KES'}`
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiDollarSign className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase text-gray-400 mb-1">Currency</p>
                  <p className="text-sm text-gray-700">
                    {storeConfig.currency || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Settings Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FiClock className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Booking Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FiClock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase text-gray-400 mb-1">Min Booking Notice</p>
                  <p className="text-sm text-gray-700">
                    {storeConfig.minBookingNotice !== undefined
                      ? formatMinutes(storeConfig.minBookingNotice)
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiClock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase text-gray-400 mb-1">Late Grace Period</p>
                  <p className="text-sm text-gray-700">
                    {storeConfig.lateGracePeriod !== undefined
                      ? formatMinutes(storeConfig.lateGracePeriod)
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiUserPlus className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase text-gray-400 mb-1">Allow Walk-ins</p>
                  <div className="mt-1">
                    {storeConfig.allowWalkIns !== undefined ? (
                      <StatusBadge status={storeConfig.allowWalkIns} type="service-status" />
                    ) : (
                      <p className="text-sm text-gray-700">—</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings Section */}
          {storeConfig.notificationSettings && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FiBell className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiSmartphone className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase text-gray-400 mb-1">Send SMS</p>
                    <div className="mt-1">
                      <StatusBadge status={storeConfig.notificationSettings.sendSMS} type="service-status" />
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiMail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase text-gray-400 mb-1">Send Email</p>
                    <div className="mt-1">
                      <StatusBadge status={storeConfig.notificationSettings.sendEmail} type="service-status" />
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiBell className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase text-gray-400 mb-1">Send Push</p>
                    <div className="mt-1">
                      <StatusBadge status={storeConfig.notificationSettings.sendPush} type="service-status" />
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiClock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase text-gray-400 mb-1">Reminder Times</p>
                    <p className="text-sm text-gray-700">
                      {storeConfig.notificationSettings.reminderTimes
                        ? formatReminderTimes(storeConfig.notificationSettings.reminderTimes)
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Settings Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FiGlobe className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-semibold text-gray-900">Business Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FiGlobe className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase text-gray-400 mb-1">Timezone</p>
                  <p className="text-sm text-gray-700">
                    {storeConfig.businessHoursTimezone || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Information Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FiCalendar className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FiCalendar className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase text-gray-400 mb-1">Created</p>
                  <p className="text-sm text-gray-700">
                    {formatDateTime(storeConfig.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiCalendar className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase text-gray-400 mb-1">Last Updated</p>
                  <p className="text-sm text-gray-700">
                    {formatDateTime(storeConfig.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StoreConfig

