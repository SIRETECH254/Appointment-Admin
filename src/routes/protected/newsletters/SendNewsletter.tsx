import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiSend, FiX } from 'react-icons/fi';
import { useSendNewsletter, useGetSubscriptionStats } from '../../../tanstack/useNewsletters';
import type { SendNewsletterPayload, NewsletterStatus } from '../../../types/api.types';

/**
 * Inline message type for form feedback
 */
type InlineMessage = {
  type: 'success' | 'error';
  text: string;
};

/**
 * SendNewsletter Component
 *
 * Allows admin to send a newsletter to subscribers.
 * All required fields must be filled, and status filter determines recipients.
 *
 * Features:
 * - Form validation (required fields)
 * - Sends newsletter via API
 * - Shows success/error feedback
 * - Preview count of recipients
 * - Status filter for targeting specific subscribers
 */
const SendNewsletter = () => {
  const navigate = useNavigate();

  // TanStack Query hooks
  const sendNewsletter = useSendNewsletter();
  const { data: statsData } = useGetSubscriptionStats();

  // Extract stats from API response
  const stats = statsData as any;

  // Form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<NewsletterStatus>('SUBSCRIBED');

  // UI state
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Get preview count based on status filter
   */
  const previewCount = useMemo(() => {
    if (!stats) return 0;
    switch (status) {
      case 'SUBSCRIBED':
        return stats.subscribed || 0;
      case 'UNSUBSCRIBED':
        return stats.unsubscribed || 0;
      case 'BOUNCED':
        return stats.bounced || 0;
      default:
        return 0;
    }
  }, [stats, status]);

  /**
   * Determine if form can be submitted
   * Requires subject and message
   */
  const canSubmit = useMemo(() => {
    return Boolean(
      subject.trim() &&
      message.trim() &&
      !isSubmitting
    );
  }, [subject, message, isSubmitting]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      setInlineMessage({ type: 'error', text: 'Subject and message are required.' });
      return;
    }

    if (previewCount === 0) {
      setInlineMessage({ type: 'error', text: 'No subscribers found with the selected status.' });
      return;
    }

    setIsSubmitting(true);
    setInlineMessage(null);

    try {
      const payload: SendNewsletterPayload = {
        subject: subject.trim(),
        message: message.trim(),
        status,
      };

      await sendNewsletter.mutateAsync(payload);
      setInlineMessage({ type: 'success', text: `Newsletter sent successfully to ${previewCount} subscribers.` });
      
      // Navigate back to list after a short delay
      setTimeout(() => {
        navigate('/newsletters');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message ?? 'An error occurred';
      setInlineMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }, [subject, message, status, previewCount, sendNewsletter, navigate]);

  /**
   * Clear inline message
   */
  const clearMessage = useCallback(() => {
    setInlineMessage(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Send Newsletter</h1>
          <p className="mt-1 text-sm text-gray-500">
            Send a newsletter to subscribers
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Inline message display */}
          {inlineMessage && (
            <div
              className={`flex items-center justify-between rounded-lg p-4 ${
                inlineMessage.type === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              <p className="text-sm font-medium">{inlineMessage.text}</p>
              <button
                type="button"
                onClick={clearMessage}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Status filter */}
          <div>
            <label htmlFor="status" className="label">
              Target Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as NewsletterStatus)}
              className="input-select"
            >
              <option value="SUBSCRIBED">Subscribed</option>
              <option value="UNSUBSCRIBED">Unsubscribed</option>
              <option value="BOUNCED">Bounced</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              This newsletter will be sent to subscribers with status: <strong>{status}</strong>
            </p>
          </div>

          {/* Preview count */}
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center gap-2">
              <FiMail className="h-5 w-5 text-blue-600" />
              <p className="text-sm font-medium text-blue-900">
                {previewCount} subscriber{previewCount !== 1 ? 's' : ''} will receive this newsletter
              </p>
            </div>
          </div>

          {/* Subject input */}
          <div>
            <label htmlFor="subject" className="label">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter newsletter subject..."
              className="input"
              required
            />
          </div>

          {/* Message textarea */}
          <div>
            <label htmlFor="message" className="label">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter newsletter message..."
              className="input"
              rows={10}
              required
            />
          </div>

          {/* Form actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              to="/newsletters"
              className="btn-secondary flex-1 sm:flex-initial"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-initial disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <FiSend className="h-4 w-4" />
                  Send Newsletter
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendNewsletter;
