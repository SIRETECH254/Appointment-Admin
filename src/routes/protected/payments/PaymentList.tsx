import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdVisibility, MdAdd } from 'react-icons/md';
import { useGetAllPayments } from '../../../tanstack/usePayments';
import Pagination from '../../../components/ui/Pagination';
import { formatPaymentStatus, getPaymentStatusVariant, formatPaymentMethod, formatPaymentType, formatCurrency, getPaymentCustomerName } from '../../../utils/paymentUtils';
import { formatDateTime } from '../../../utils/userUtils';
import type { IPayment } from '../../../types/api.types';

/**
 * PaymentList Component
 * 
 * Displays a paginated table of all payments with search, filtering, and view actions.
 */
const PaymentList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const params = useMemo(() => {
    const apiParams: any = { page: currentPage, limit: itemsPerPage };
    if (debouncedSearch.trim()) apiParams.search = debouncedSearch.trim();
    if (filterStatus !== 'all') apiParams.status = filterStatus.toUpperCase();
    if (filterMethod !== 'all') apiParams.method = filterMethod.toUpperCase();
    if (filterType !== 'all') apiParams.type = filterType.toUpperCase();
    return apiParams;
  }, [debouncedSearch, filterStatus, filterMethod, filterType, currentPage, itemsPerPage]);

  const { data, isLoading, isError, error } = useGetAllPayments(params);
  const payments = (data as any)?.payments || (data as any)?.data?.payments || [];
  const pagination = (data as any)?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const errorMessage = (error as any)?.response?.data?.message || 'Failed to load payments.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-y-2 items-start md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="mt-1 text-sm text-gray-500">Track and manage payments</p>
        </div>
        <Link to="/payments/service" className="btn-primary flex items-center gap-2">
          <span>Service Payment</span>
          <MdAdd size={24} />
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-y-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search payments..."
              className="input-search"
            />
          </div>

          <div className="flex flex-row gap-2 flex-wrap items-center">
            <div className="flex-1 min-w-[150px]">
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="input-select w-full">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <select value={filterMethod} onChange={(e) => { setFilterMethod(e.target.value); setCurrentPage(1); }} className="input-select w-full">
                <option value="all">All Methods</option>
                <option value="mpesa">M-Pesa</option>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }} className="input-select w-full">
                <option value="all">All Types</option>
                <option value="booking_fee">Booking Fee</option>
                <option value="full_payment">Full Payment</option>
              </select>
            </div>
            <div>
              <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="input-select w-full">
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Payment #</th>
              <th className="table-header-cell">Customer</th>
              <th className="table-header-cell">Amount</th>
              <th className="table-header-cell">Method</th>
              <th className="table-header-cell">Type</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Date</th>
              <th className="table-header-cell-right">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {isLoading && (
              <>
                {[...Array(5)].map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="table-cell">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}

            {isError && !isLoading && (
              <tr>
                <td colSpan={8} className="table-cell-center">
                  <div className="alert-error mx-auto max-w-md">{errorMessage}</div>
                </td>
              </tr>
            )}

            {!isLoading && !isError && payments.length === 0 && (
              <tr>
                <td colSpan={8} className="table-cell-center">
                  <p className="text-gray-500">No payments found.</p>
                </td>
              </tr>
            )}

            {!isLoading && !isError && payments.map((payment: IPayment) => {
              const statusVariant = getPaymentStatusVariant(payment.status);
              return (
                <tr key={payment._id} className="table-row">
                  <td className="table-cell-text font-mono text-sm">{payment.paymentNumber || payment._id.slice(0, 8)}</td>
                  <td className="table-cell-text">{getPaymentCustomerName(payment)}</td>
                  <td className="table-cell-text">{formatCurrency(payment.amount, payment.currency || 'KES')}</td>
                  <td className="table-cell-text">{formatPaymentMethod(payment.method)}</td>
                  <td className="table-cell-text">{formatPaymentType(payment.type)}</td>
                  <td className="table-cell">
                    <span className={`badge badge-${statusVariant}`}>{formatPaymentStatus(payment.status)}</span>
                  </td>
                  <td className="table-cell-text">{formatDateTime(payment.createdAt)}</td>
                  <td className="table-cell">
                    <Link to={`/payments/${payment._id}`} className="btn-ghost btn-sm flex items-center gap-1" title="View payment">
                      <MdVisibility className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!isLoading && !isError && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentList;
