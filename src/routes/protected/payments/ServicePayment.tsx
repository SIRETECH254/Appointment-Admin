import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInitiatePayment } from '../../../tanstack/usePayments';
import { useGetAllServices } from '../../../tanstack/useServices';
import { formatCurrency } from '../../../utils/paymentUtils';

/**
 * ServicePayment Component
 * 
 * Allows payment for services without an appointment.
 * Features:
 * - Service selection (multi-select)
 * - Payment method selection (MPESA/CARD)
 * - Navigates to payment status page after initiation
 */
const ServicePayment = () => {
  const navigate = useNavigate();
  const { data: servicesData } = useGetAllServices({ status: 'active' });
  const initiatePayment = useInitiatePayment();

  const allServices = (servicesData as any)?.services || (servicesData as any)?.data?.services || [];
  const [services, setServices] = useState<string[]>([]);
  const [method, setMethod] = useState<'MPESA' | 'CARD'>('MPESA');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [inlineMessage, setInlineMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = useMemo(() => {
    return services.reduce((sum, serviceId) => {
      const service = allServices.find((s: any) => s._id === serviceId);
      return sum + (service?.fullPrice || 0);
    }, 0);
  }, [services, allServices]);

  const canSubmit = useMemo(() => {
    if (!services.length || !method || isSubmitting) return false;
    if (method === 'MPESA') return Boolean(phone?.trim());
    if (method === 'CARD') return Boolean(email?.trim());
    return false;
  }, [services, method, phone, email, isSubmitting]);

  const handleServiceToggle = (serviceId: string) => {
    setServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const result = await initiatePayment.mutateAsync({
        services,
        method,
        phone: method === 'MPESA' ? phone : undefined,
        email: method === 'CARD' ? email : undefined,
      });

      const paymentId = result.payment?._id || result.paymentId;
      const checkoutId = result.gateway?.checkoutRequestId;
      navigate(`/payments/status?paymentId=${paymentId}${checkoutId ? `&checkoutId=${checkoutId}` : ''}`);
    } catch (error: any) {
      setInlineMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to initiate payment.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Service Payment</h1>
        <p className="mt-1 text-sm text-gray-500">Pay for services without an appointment.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="label">Select Services</label>
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded p-4">
              {allServices.map((service: any) => (
                <label key={service._id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={services.includes(service._id)}
                    onChange={() => handleServiceToggle(service._id)}
                    className="rounded"
                  />
                  <span className="flex-1">
                    {service.name} - {formatCurrency(service.fullPrice, 'KES')} ({service.duration} min)
                  </span>
                </label>
              ))}
            </div>
          </div>

          {totalAmount > 0 && (
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-lg font-semibold text-gray-900">
                Total Amount: {formatCurrency(totalAmount, 'KES')}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Payment Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value as 'MPESA' | 'CARD')} className="input-select">
                <option value="MPESA">M-Pesa</option>
                <option value="CARD">Card (Paystack)</option>
              </select>
            </div>

            {method === 'MPESA' && (
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254712345678"
                  className="input"
                  required
                />
              </div>
            )}

            {method === 'CARD' && (
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="input"
                  required
                />
              </div>
            )}

            {inlineMessage && (
              <div className={`alert-${inlineMessage.type}`}>{inlineMessage.text}</div>
            )}

            <div className="flex gap-3">
              <Link to="/payments" className="btn-secondary">
                Cancel
              </Link>
              <button type="submit" disabled={!canSubmit} className="btn-primary">
                {isSubmitting ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServicePayment;
