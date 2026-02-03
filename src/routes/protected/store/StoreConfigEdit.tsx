import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  useGetStoreConfiguration,
  useUpdateStoreConfiguration,
} from '../../../tanstack/useStoreConfig'
import { parseReminderTimes } from '../../../utils/storeConfigUtils'

type InlineMessage = {
  type: 'success' | 'error'
  text: string
}

const StoreConfigEdit = () => {
  // Routing + state helpers
  const navigate = useNavigate()
  // Store configuration query + mutation hooks
  const { data, isLoading } = useGetStoreConfiguration()
  const updateStoreConfiguration = useUpdateStoreConfiguration()

  // Extract storeConfiguration from API response
  const storeConfig = (data as any)?.storeConfiguration ?? data

  // Form field state
  const [appointmentFeeType, setAppointmentFeeType] = useState<'fixed' | 'percentage'>('fixed')
  const [appointmentFeeValue, setAppointmentFeeValue] = useState<number>(0)
  const [currency, setCurrency] = useState<string>('KES')
  const [minBookingNotice, setMinBookingNotice] = useState<number>(0)
  const [lateGracePeriod, setLateGracePeriod] = useState<number>(0)
  const [allowWalkIns, setAllowWalkIns] = useState<boolean>(true)
  const [notificationSettings, setNotificationSettings] = useState({
    sendSMS: true,
    sendEmail: true,
    sendPush: false,
    reminderTimes: [] as number[],
  })
  const [reminderTimesInput, setReminderTimesInput] = useState<string>('')
  const [businessHoursTimezone, setBusinessHoursTimezone] = useState<string>('Africa/Nairobi')
  // Inline feedback for form actions
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Ref for delayed navigation
  const redirectTimer = useRef<number | null>(null)

  // Hydrate form state from the store configuration payload
  useEffect(() => {
    if (!storeConfig) return

    if (storeConfig.appointmentFeeType !== undefined) {
      // Convert to lowercase to match TypeScript type
      const feeType = storeConfig.appointmentFeeType.toLowerCase() as 'fixed' | 'percentage'
      setAppointmentFeeType(feeType)
    }
    if (storeConfig.appointmentFeeValue !== undefined) {
      setAppointmentFeeValue(storeConfig.appointmentFeeValue)
    }
    if (storeConfig.currency !== undefined) {
      setCurrency(storeConfig.currency)
    }
    if (storeConfig.minBookingNotice !== undefined) {
      setMinBookingNotice(storeConfig.minBookingNotice)
    }
    if (storeConfig.lateGracePeriod !== undefined) {
      setLateGracePeriod(storeConfig.lateGracePeriod)
    }
    if (storeConfig.allowWalkIns !== undefined) {
      setAllowWalkIns(storeConfig.allowWalkIns)
    }
    if (storeConfig.businessHoursTimezone !== undefined) {
      setBusinessHoursTimezone(storeConfig.businessHoursTimezone)
    }
    if (storeConfig.notificationSettings) {
      setNotificationSettings({
        sendSMS: storeConfig.notificationSettings.sendSMS ?? true,
        sendEmail: storeConfig.notificationSettings.sendEmail ?? true,
        sendPush: storeConfig.notificationSettings.sendPush ?? false,
        reminderTimes: storeConfig.notificationSettings.reminderTimes ?? [],
      })
      // Set reminder times input as comma-separated string
      if (storeConfig.notificationSettings.reminderTimes) {
        setReminderTimesInput(
          storeConfig.notificationSettings.reminderTimes.join(', ')
        )
      }
    }
  }, [storeConfig])

  // Cleanup: cancel delayed navigation on unmount
  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        window.clearTimeout(redirectTimer.current)
      }
    }
  }, [])

  // Disable submit if required fields are invalid or already submitting
  const canSubmit = useMemo(() => {
    return (
      appointmentFeeValue >= 0 &&
      minBookingNotice >= 0 &&
      lateGracePeriod >= 0 &&
      !isSubmitting
    )
  }, [appointmentFeeValue, minBookingNotice, lateGracePeriod, isSubmitting])

  // Validate fields, build payload, and submit configuration changes
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      // Validate numeric fields
      if (appointmentFeeValue < 0) {
        setInlineMessage({
          type: 'error',
          text: 'Appointment fee value cannot be negative.',
        })
        return
      }

      if (minBookingNotice < 0) {
        setInlineMessage({
          type: 'error',
          text: 'Minimum booking notice cannot be negative.',
        })
        return
      }

      if (lateGracePeriod < 0) {
        setInlineMessage({
          type: 'error',
          text: 'Late grace period cannot be negative.',
        })
        return
      }

      // Parse and validate reminder times
      const reminderTimes = parseReminderTimes(reminderTimesInput)
      if (reminderTimesInput.trim() && reminderTimes.length === 0) {
        setInlineMessage({
          type: 'error',
          text: 'Invalid reminder times format. Please use comma-separated numbers.',
        })
        return
      }

      setInlineMessage(null)
      setIsSubmitting(true)

      try {
        // Create payload matching API structure (TypeScript types may differ from actual API)
        const payload: any = {
          appointmentFeeType,
          appointmentFeeValue,
          currency,
          minBookingNotice,
          lateGracePeriod,
          allowWalkIns,
          notificationSettings: {
            sendSMS: notificationSettings.sendSMS,
            sendEmail: notificationSettings.sendEmail,
            sendPush: notificationSettings.sendPush,
            reminderTimes,
          },
          businessHoursTimezone,
        }

        // Persist the update
        await updateStoreConfiguration.mutateAsync(payload)

        // Show success feedback and navigate back to overview
        setInlineMessage({
          type: 'success',
          text: 'Store configuration updated successfully.',
        })

        redirectTimer.current = window.setTimeout(() => {
          navigate('/store', { replace: true })
        }, 1200)
      } catch (submitError: any) {
        const errorMessage =
          submitError?.response?.data?.message ||
          'Unable to update store configuration.'
        setInlineMessage({ type: 'error', text: errorMessage })
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      appointmentFeeType,
      appointmentFeeValue,
      currency,
      minBookingNotice,
      lateGracePeriod,
      allowWalkIns,
      notificationSettings,
      reminderTimesInput,
      businessHoursTimezone,
      updateStoreConfiguration,
      navigate,
    ],
  )

  return (
    // Page wrapper: keep consistent spacing between the header and form
    <div className="space-y-6">
      {/* Header card: title and explanation */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          {/* Page title */}
          <h1 className="text-xl font-semibold text-gray-900">
            Edit Store Configuration
          </h1>
          {/* Supporting hint to guide the user */}
          <p className="text-sm text-gray-500">
            Update your store settings and policies
          </p>
        </div>
      </div>

      {/* Edit store configuration form */}
      <form
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        {/* Appointment Fee Section */}
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4">
            Appointment Fee
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="auth-field">
              <label className="label">Appointment Fee Type</label>
              <select
                value={appointmentFeeType}
                onChange={(event) =>
                  setAppointmentFeeType(event.target.value as 'fixed' | 'percentage')
                }
                className="input"
              >
                <option value="fixed">FIXED</option>
                <option value="percentage">PERCENTAGE</option>
              </select>
            </div>
            <div className="auth-field">
              <label className="label">Appointment Fee Value</label>
              <input
                type="number"
                value={appointmentFeeValue}
                onChange={(event) =>
                  setAppointmentFeeValue(Number(event.target.value))
                }
                min="0"
                step="0.01"
                placeholder="200"
                className="input"
              />
            </div>
            <div className="auth-field">
              <label className="label">Currency</label>
              <input
                value={currency}
                disabled
                className="input-disabled"
              />
            </div>
          </div>
        </div>

        {/* Booking Settings Section */}
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4">
            Booking Settings
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="auth-field">
              <label className="label">Min Booking Notice (minutes)</label>
              <input
                type="number"
                value={minBookingNotice}
                onChange={(event) =>
                  setMinBookingNotice(Number(event.target.value))
                }
                min="0"
                placeholder="60"
                className="input"
              />
            </div>
            <div className="auth-field">
              <label className="label">Late Grace Period (minutes)</label>
              <input
                type="number"
                value={lateGracePeriod}
                onChange={(event) =>
                  setLateGracePeriod(Number(event.target.value))
                }
                min="0"
                placeholder="10"
                className="input"
              />
            </div>
            <div className="auth-field md:col-span-2">
              <label className="label flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allowWalkIns}
                  onChange={(event) => setAllowWalkIns(event.target.checked)}
                  className="form-checkbox"
                />
                <span>Allow Walk-ins</span>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings Section */}
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4">
            Notification Settings
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="auth-field">
              <label className="label flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notificationSettings.sendSMS}
                  onChange={(event) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      sendSMS: event.target.checked,
                    })
                  }
                  className="form-checkbox"
                />
                <span>Send SMS</span>
              </label>
            </div>
            <div className="auth-field">
              <label className="label flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notificationSettings.sendEmail}
                  onChange={(event) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      sendEmail: event.target.checked,
                    })
                  }
                  className="form-checkbox"
                />
                <span>Send Email</span>
              </label>
            </div>
            <div className="auth-field">
              <label className="label flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notificationSettings.sendPush}
                  onChange={(event) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      sendPush: event.target.checked,
                    })
                  }
                  className="form-checkbox"
                />
                <span>Send Push</span>
              </label>
            </div>
            <div className="auth-field md:col-span-2">
              <label className="label">Reminder Times (comma-separated, in minutes)</label>
              <input
                value={reminderTimesInput}
                onChange={(event) => setReminderTimesInput(event.target.value)}
                placeholder="1440, 120, 30"
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter reminder times in minutes before appointment (e.g., 1440 for 1 day, 120 for 2 hours)
              </p>
            </div>
          </div>
        </div>

        {/* Business Settings Section */}
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4">
            Business Settings
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="auth-field">
              <label className="label">Timezone</label>
              <input
                value={businessHoursTimezone}
                disabled
                className="input-disabled"
              />
            </div>
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
          {/* Cancel returns to the store configuration overview */}
          <Link to="/store" className="btn-secondary">
            Cancel
          </Link>
          {/* Save changes button reflects loading state */}
          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="btn-primary"
          >
            {isSubmitting || updateStoreConfiguration.isPending
              ? 'Saving...'
              : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default StoreConfigEdit
