import { useCallback, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import {
  useGetContactMessageById,
  useReplyToContactMessage,
} from '../../../tanstack/useContact';
import { formatDateTimeWithTime, getRecipientEmail } from '../../../utils/contactUtils';
import type { IContact } from '../../../types/api.types';

/**
 * ContactReply Component
 *
 * Allows admin to reply to a contact message via email.
 * Displays contact context (subject, recipient, original message) and provides
 * a reply form with validation.
 *
 * Features:
 * - Contact context display
 * - Reply message textarea with character count
 * - Form validation (required, max 2000 characters)
 * - Success/error feedback
 * - Navigation back to contact details on success
 */
const ContactReply = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch contact data for context
  const { data, isLoading, isError, error } = useGetContactMessageById(id || '');

  // Reply mutation
  const replyToContact = useReplyToContactMessage();

  // Extract contact from API response
  const contact = (data as any)?.contact ?? (data as IContact);

  // Form state
  const [replyMessage, setReplyMessage] = useState('');
  const [inlineMessage, setInlineMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Get recipient email (user email if userId exists, otherwise contact email)
   */
  const recipientEmail = useMemo(() => {
    if (!contact) return '';
    return getRecipientEmail(contact);
  }, [contact]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!replyMessage.trim()) {
        setInlineMessage({ type: 'error', text: 'Reply message is required.' });
        return;
      }
      if (replyMessage.trim().length > 2000) {
        setInlineMessage({
          type: 'error',
          text: 'Reply message must be at most 2000 characters.',
        });
        return;
      }
      if (!contact) {
        setInlineMessage({ type: 'error', text: 'Contact not found.' });
        return;
      }

      setIsSubmitting(true);
      setInlineMessage(null);

      try {
        // Note: Backend expects 'message' but type uses 'reply'
        // We'll send it as 'reply' and let the API layer handle mapping if needed
        await replyToContact.mutateAsync({
          contactId: contact._id,
          replyData: { reply: replyMessage.trim() },
        });
        setInlineMessage({ type: 'success', text: 'Reply sent successfully.' });
        setTimeout(() => navigate(`/contact/${contact._id}`), 1200);
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || 'Failed to send reply.';
        setInlineMessage({ type: 'error', text: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [replyMessage, contact, replyToContact, navigate]
  );

  /**
   * Check if form can be submitted
   */
  const canSubmit = useMemo(() => {
    return (
      Boolean(replyMessage.trim()) &&
      replyMessage.trim().length <= 2000 &&
      !isSubmitting
    );
  }, [replyMessage, isSubmitting]);

  // Get error message from API response
  const errorMessage =
    (error as any)?.response?.data?.message || 'Failed to load contact.';

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500">
        Loading contact...
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-4">
        <div className="alert-error">{errorMessage}</div>
        <Link to="/contact" className="btn-secondary">
          Back to Contacts
        </Link>
      </div>
    );
  }

  // No contact found
  if (!contact) {
    return (
      <div className="space-y-4">
        <div className="alert-error">Contact not found.</div>
        <Link to="/contact" className="btn-secondary">
          Back to Contacts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <Link to={`/contact/${contact._id}`} className="btn-ghost flex items-center gap-2">
            <MdArrowBack size={20} />
            <span>Back</span>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Reply to Contact</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Contact context card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Context</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase text-gray-400 mb-1">To</p>
            <p className="text-sm text-gray-700">{recipientEmail}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400 mb-1">Subject</p>
            <p className="text-sm text-gray-700">Re: {contact.subject}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400 mb-2">Original Message</p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {contact.message}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400 mb-1">From</p>
            <p className="text-sm text-gray-700">
              {contact.name} &lt;{contact.email}&gt;
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400 mb-1">Received</p>
            <p className="text-sm text-gray-700">
              {formatDateTimeWithTime(contact.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Reply form card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reply Message</h2>

        {/* Inline message */}
        {inlineMessage && (
          <div
            className={`mb-4 ${
              inlineMessage.type === 'success' ? 'alert-success' : 'alert-error'
            }`}
          >
            {inlineMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="replyMessage" className="label">
              Reply Message
            </label>
            <textarea
              id="replyMessage"
              value={replyMessage}
              onChange={(e) => {
                setReplyMessage(e.target.value);
                setInlineMessage(null);
              }}
              rows={10}
              className="input"
              placeholder="Enter your reply message..."
              maxLength={2000}
            />
            <div className="mt-1 flex justify-between">
              <p className="text-xs text-gray-500">
                Maximum 2000 characters
              </p>
              <p
                className={`text-xs ${
                  replyMessage.length > 1900
                    ? 'text-red-600'
                    : replyMessage.length > 1500
                    ? 'text-yellow-600'
                    : 'text-gray-500'
                }`}
              >
                {replyMessage.length}/2000
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Link
              to={`/contact/${contact._id}`}
              className="btn-secondary"
              type="button"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary"
            >
              {isSubmitting ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactReply;
