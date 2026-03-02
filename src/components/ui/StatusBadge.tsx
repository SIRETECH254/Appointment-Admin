/**
 * StatusBadge Component
 * 
 * A reusable badge component that displays status with icons and proper
 * text/background color management for visibility. Used across users,
 * appointments, payments, notifications, and contacts for consistent badge styling.
 * 
 * @component
 */

import React from 'react';
import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiUser,
  FiShield,
  FiMail,
  FiMessageSquare,
  FiArchive,
  FiBell,
  FiSettings,
  FiTag,
  FiCreditCard,
  FiCalendar,
  FiHelpCircle,
  FiSend,
  FiSmartphone,
  FiActivity,
} from 'react-icons/fi';

export type BadgeType =
  | 'user-role'
  | 'user-status'
  | 'appointment-status'
  | 'payment-status'
  | 'payment-method'
  | 'notification-type'
  | 'notification-category'
  | 'notification-status'
  | 'contact-status'
  | 'service-status'
  | 'verified-status';

interface StatusBadgeProps {
  status: string | boolean;
  type: BadgeType;
  className?: string;
}

/**
 * StatusBadge component for displaying status badges with icons
 * 
 * @param status - The status string (e.g., 'PENDING', 'CONFIRMED', 'NEW', 'SUCCESS')
 * @param type - The type of badge
 * @param className - Optional additional className
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type,
  className = '',
}) => {
  /**
   * Get icon component based on status and type
   */
  const getIcon = (status: string | boolean, badgeType: BadgeType): React.ReactNode => {
    // Handle service-status with boolean
    if (badgeType === 'service-status') {
      if (status === true || status === 'true' || String(status).toUpperCase() === 'ACTIVE') {
        return <FiCheckCircle className="h-3 w-3" />;
      }
      return <FiXCircle className="h-3 w-3" />;
    }

    const upperStatus = typeof status === 'string' ? status.toUpperCase() : String(status).toUpperCase();

    if (badgeType === 'user-role') {
      switch (upperStatus) {
        case 'ADMIN':
          return <FiShield className="h-3 w-3" />;
        case 'STAFF':
          return <FiUser className="h-3 w-3" />;
        case 'CLIENT':
        case 'CUSTOMER':
          return <FiUser className="h-3 w-3" />;
        default:
          return <FiHelpCircle className="h-3 w-3" />;
      }
    }

    if (badgeType === 'user-status') {
      switch (upperStatus) {
        case 'ACTIVE':
          return <FiCheckCircle className="h-3 w-3" />;
        case 'INACTIVE':
          return <FiXCircle className="h-3 w-3" />;
        case 'SUSPENDED':
          return <FiAlertCircle className="h-3 w-3" />;
        case 'PENDING':
          return <FiClock className="h-3 w-3" />;
        default:
          return <FiHelpCircle className="h-3 w-3" />;
      }
    }

    if (badgeType === 'appointment-status') {
      switch (upperStatus) {
        case 'PENDING':
          return <FiClock className="h-3 w-3" />;
        case 'CONFIRMED':
          return <FiCheckCircle className="h-3 w-3" />;
        case 'COMPLETED':
          return <FiCheckCircle className="h-3 w-3" />;
        case 'CANCELLED':
        case 'NO_SHOW':
          return <FiXCircle className="h-3 w-3" />;
        default:
          return <FiHelpCircle className="h-3 w-3" />;
      }
    }

    if (badgeType === 'payment-status') {
      switch (upperStatus) {
        case 'SUCCESS':
        case 'COMPLETED':
          return <FiCheckCircle className="h-3 w-3" />;
        case 'PENDING':
        case 'PROCESSING':
          return <FiClock className="h-3 w-3" />;
        case 'FAILED':
        case 'CANCELLED':
          return <FiXCircle className="h-3 w-3" />;
        case 'REFUNDED':
          return <FiCreditCard className="h-3 w-3" />;
        default:
          return <FiHelpCircle className="h-3 w-3" />;
      }
    }

    if (badgeType === 'payment-method') {
      switch (upperStatus) {
        case 'MPESA':
          return <FiSmartphone className="h-3 w-3" />;
        case 'CARD':
        case 'PAYSTACK':
          return <FiCreditCard className="h-3 w-3" />;
        case 'CASH':
          return <FiTag className="h-3 w-3" />;
        default:
          return <FiHelpCircle className="h-3 w-3" />;
      }
    }

    if (badgeType === 'notification-type') {
      switch (upperStatus) {
        case 'EMAIL':
          return <FiMail className="h-3 w-3" />;
        case 'SMS':
          return <FiSmartphone className="h-3 w-3" />;
        case 'PUSH':
          return <FiBell className="h-3 w-3" />;
        case 'IN_APP':
          return <FiActivity className="h-3 w-3" />;
        default:
          return <FiBell className="h-3 w-3" />;
      }
    }

    if (badgeType === 'notification-category') {
      switch (upperStatus) {
        case 'APPOINTMENT':
          return <FiCalendar className="h-3 w-3" />;
        case 'PAYMENT':
          return <FiCreditCard className="h-3 w-3" />;
        case 'SYSTEM':
          return <FiSettings className="h-3 w-3" />;
        case 'PROMOTIONAL':
          return <FiTag className="h-3 w-3" />;
        case 'GENERAL':
          return <FiBell className="h-3 w-3" />;
        default:
          return <FiBell className="h-3 w-3" />;
      }
    }

    if (badgeType === 'notification-status') {
      switch (upperStatus) {
        case 'SENT':
          return <FiCheckCircle className="h-3 w-3" />;
        case 'PENDING':
          return <FiClock className="h-3 w-3" />;
        case 'FAILED':
          return <FiXCircle className="h-3 w-3" />;
        case 'READ':
          return <FiCheckCircle className="h-3 w-3" />;
        default:
          return <FiHelpCircle className="h-3 w-3" />;
      }
    }

    if (badgeType === 'contact-status') {
      switch (upperStatus) {
        case 'NEW':
          return <FiMail className="h-3 w-3" />;
        case 'READ':
          return <FiMessageSquare className="h-3 w-3" />;
        case 'REPLIED':
          return <FiSend className="h-3 w-3" />;
        case 'ARCHIVED':
          return <FiArchive className="h-3 w-3" />;
        default:
          return <FiHelpCircle className="h-3 w-3" />;
      }
    }

    if (badgeType === 'verified-status') {
      if (status === true || status === 'true' || upperStatus === 'VERIFIED' || upperStatus === 'YES') {
        return <FiCheckCircle className="h-3 w-3" />;
      }
      return <FiXCircle className="h-3 w-3" />;
    }

    // Default fallback for any unhandled badge types

    return <FiHelpCircle className="h-3 w-3" />;
  };

  /**
   * Get status variant (background and text colors) based on status and type
   */
  const getStatusVariant = (
    status: string | boolean,
    badgeType: BadgeType
  ): { bg: string; text: string; iconColor: string } => {
    // Handle service-status with boolean
    if (badgeType === 'service-status') {
      if (status === true || status === 'true' || String(status).toUpperCase() === 'ACTIVE') {
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          iconColor: '#16A34A', // green-600
        };
      }
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        iconColor: '#DC2626', // red-600
      };
    }

    const upperStatus = typeof status === 'string' ? status.toUpperCase() : String(status).toUpperCase();

    if (badgeType === 'user-role') {
      switch (upperStatus) {
        case 'ADMIN':
          return {
            bg: 'bg-purple-100',
            text: 'text-purple-700',
            iconColor: '#7C3AED', // purple-600
          };
        case 'STAFF':
          return {
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            iconColor: '#2563EB', // blue-600
          };
        case 'CLIENT':
        case 'CUSTOMER':
          return {
            bg: 'bg-green-100',
            text: 'text-green-700',
            iconColor: '#16A34A', // green-600
          };
        default:
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#4B5563', // gray-600
          };
      }
    }

    if (badgeType === 'user-status') {
      switch (upperStatus) {
        case 'ACTIVE':
          return {
            bg: 'bg-green-100',
            text: 'text-green-700',
            iconColor: '#16A34A', // green-600
          };
        case 'INACTIVE':
          return {
            bg: 'bg-red-100',
            text: 'text-red-700',
            iconColor: '#DC2626', // red-600
          };
        case 'SUSPENDED':
          return {
            bg: 'bg-red-100',
            text: 'text-red-700',
            iconColor: '#DC2626', // red-600
          };
        case 'PENDING':
          return {
            bg: 'bg-yellow-100',
            text: 'text-yellow-700',
            iconColor: '#CA8A04', // yellow-600
          };
        default:
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#4B5563', // gray-600
          };
      }
    }

    if (badgeType === 'appointment-status') {
      switch (upperStatus) {
        case 'PENDING':
          return {
            bg: 'bg-yellow-100',
            text: 'text-yellow-700',
            iconColor: '#CA8A04', // yellow-600
          };
        case 'CONFIRMED':
          return {
            bg: 'bg-green-100',
            text: 'text-green-700',
            iconColor: '#16A34A', // green-600
          };
        case 'COMPLETED':
          return {
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            iconColor: '#2563EB', // blue-600
          };
        case 'CANCELLED':
        case 'NO_SHOW':
          return {
            bg: 'bg-red-100',
            text: 'text-red-700',
            iconColor: '#DC2626', // red-600
          };
        default:
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#4B5563', // gray-600
          };
      }
    }

    if (badgeType === 'payment-status') {
      switch (upperStatus) {
        case 'SUCCESS':
        case 'COMPLETED':
          return {
            bg: 'bg-green-100',
            text: 'text-green-700',
            iconColor: '#16A34A', // green-600
          };
        case 'PENDING':
        case 'PROCESSING':
          return {
            bg: 'bg-yellow-100',
            text: 'text-yellow-700',
            iconColor: '#CA8A04', // yellow-600
          };
        case 'FAILED':
        case 'CANCELLED':
          return {
            bg: 'bg-red-100',
            text: 'text-red-700',
            iconColor: '#DC2626', // red-600
          };
        case 'REFUNDED':
          return {
            bg: 'bg-orange-100',
            text: 'text-orange-700',
            iconColor: '#EA580C', // orange-600
          };
        default:
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#4B5563', // gray-600
          };
      }
    }

    if (badgeType === 'payment-method') {
      switch (upperStatus) {
        case 'MPESA':
          return {
            bg: 'bg-green-100',
            text: 'text-green-700',
            iconColor: '#16A34A', // green-600
          };
        case 'CARD':
        case 'PAYSTACK':
          return {
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            iconColor: '#2563EB', // blue-600
          };
        case 'CASH':
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#4B5563', // gray-600
          };
        default:
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#4B5563', // gray-600
          };
      }
    }

    if (badgeType === 'notification-type') {
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        iconColor: '#475569', // slate-600
      };
    }

    if (badgeType === 'notification-category') {
      switch (upperStatus) {
        case 'APPOINTMENT':
          return {
            bg: 'bg-amber-100',
            text: 'text-amber-700',
            iconColor: '#D97706', // amber-600
          };
        case 'PAYMENT':
          return {
            bg: 'bg-orange-100',
            text: 'text-orange-700',
            iconColor: '#EA580C', // orange-600
          };
        case 'SYSTEM':
          return {
            bg: 'bg-teal-100',
            text: 'text-teal-700',
            iconColor: '#0D9488', // teal-600
          };
        case 'PROMOTIONAL':
          return {
            bg: 'bg-yellow-100',
            text: 'text-yellow-700',
            iconColor: '#CA8A04', // yellow-600
          };
        case 'GENERAL':
          return {
            bg: 'bg-amber-100',
            text: 'text-amber-700',
            iconColor: '#D97706', // amber-600
          };
        default:
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#4B5563', // gray-600
          };
      }
    }

    if (badgeType === 'notification-status') {
      switch (upperStatus) {
        case 'SENT':
        case 'READ':
          return {
            bg: 'bg-green-100',
            text: 'text-green-700',
            iconColor: '#16A34A', // green-600
          };
        case 'PENDING':
          return {
            bg: 'bg-yellow-100',
            text: 'text-yellow-700',
            iconColor: '#CA8A04', // yellow-600
          };
        case 'FAILED':
          return {
            bg: 'bg-red-100',
            text: 'text-red-700',
            iconColor: '#DC2626', // red-600
          };
        default:
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#4B5563', // gray-600
          };
      }
    }

    if (badgeType === 'contact-status') {
      switch (upperStatus) {
        case 'NEW':
          return {
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            iconColor: '#2563EB', // blue-600
          };
        case 'READ':
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#4B5563', // gray-600
          };
        case 'REPLIED':
          return {
            bg: 'bg-green-100',
            text: 'text-green-700',
            iconColor: '#16A34A', // green-600
          };
        case 'ARCHIVED':
          return {
            bg: 'bg-orange-100',
            text: 'text-orange-700',
            iconColor: '#EA580C', // orange-600
          };
        default:
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#4B5563', // gray-600
          };
      }
    }

    if (badgeType === 'verified-status') {
      if (status === true || status === 'true' || upperStatus === 'VERIFIED' || upperStatus === 'YES') {
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          iconColor: '#16A34A', // green-600
        };
      }
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        iconColor: '#DC2626', // red-600
      };
    }

    return {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      iconColor: '#4B5563',
    };
  };

  /**
   * Format status text for display
   */
  const formatStatus = (status: string | boolean, badgeType: BadgeType): string => {
    // Handle service-status with boolean
    if (badgeType === 'service-status') {
      if (status === true || status === 'true' || String(status).toUpperCase() === 'ACTIVE') {
        return 'Active';
      }
      return 'Inactive';
    }

    // Handle verified-status with boolean
    if (badgeType === 'verified-status') {
      if (status === true || status === 'true' || String(status).toUpperCase() === 'VERIFIED' || String(status).toUpperCase() === 'YES') {
        return 'Verified';
      }
      return 'Not Verified';
    }

    // For notification types, use special formatting
    if (badgeType === 'notification-type') {
      const upperStatus = typeof status === 'string' ? status.toUpperCase() : String(status).toUpperCase();
      switch (upperStatus) {
        case 'IN_APP':
          return 'In-App';
        case 'EMAIL':
          return 'Email';
        case 'SMS':
          return 'SMS';
        case 'PUSH':
          return 'Push';
        default:
          const statusStr = typeof status === 'string' ? status : String(status);
          return statusStr.charAt(0).toUpperCase() + statusStr.slice(1).toLowerCase().replace(/_/g, ' ');
      }
    }

    // For payment methods, use special formatting
    if (badgeType === 'payment-method') {
      const upperStatus = typeof status === 'string' ? status.toUpperCase() : String(status).toUpperCase();
      switch (upperStatus) {
        case 'MPESA':
          return 'M-Pesa';
        case 'CARD':
        case 'PAYSTACK':
          return 'Card';
        case 'CASH':
          return 'Cash';
        default:
          const statusStr = typeof status === 'string' ? status : String(status);
          return statusStr.charAt(0).toUpperCase() + statusStr.slice(1).toLowerCase().replace(/_/g, ' ');
      }
    }

    // Replace all underscores with spaces and capitalize
    const statusStr = typeof status === 'string' ? status : String(status);
    return statusStr.charAt(0).toUpperCase() + statusStr.slice(1).toLowerCase().replace(/_/g, ' ');
  };

  const variant = getStatusVariant(status, type);
  const icon = getIcon(status, type);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs whitespace-nowrap font-semibold ${variant.bg} ${variant.text} ${className}`}
    >
      <span style={{ color: variant.iconColor }}>{icon}</span>
      <span>{formatStatus(status, type)}</span>
    </span>
  );
};

export default StatusBadge;
