import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { FiSearch, FiFilter, FiList, FiEye } from 'react-icons/fi';
import { useGetAllPayments } from '../../../tanstack/usePayments';
import Pagination from '../../../components/ui/Pagination';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatPaymentMethod, formatPaymentType, formatCurrency, getPaymentCustomerName } from '../../../utils/paymentUtils';
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
      {/* Page header with title and Add Payment button */}
      <header className="">
        {/* title and description */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage payments
          </p>
        </div>

        {/* search Bar and Add button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search input */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search payments..."
                className="input-search"
              />
            </div>
          </div>

          {/* Add payment button */}
          <Link to="/payments/service" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span>Service Payment</span>
            <MdAdd size={24} />
          </Link>
        </div>

        {/* payment count & filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* payment count */}
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.total} payments</p>
          </div>

          {/* filters */}
          <div className="flex flex-wrap gap-2">
            {/* Status filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="input-select pl-10"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Method filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterMethod}
                onChange={(e) => { setFilterMethod(e.target.value); setCurrentPage(1); }}
                className="input-select pl-10"
              >
                <option value="all">All Methods</option>
                <option value="mpesa">M-Pesa</option>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            {/* Type filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                className="input-select pl-10"
              >
                <option value="all">All Types</option>
                <option value="booking_fee">Booking Fee</option>
                <option value="full_payment">Full Payment</option>
              </select>
            </div>

            {/* Items per page */}
            <div className="relative">
              <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="input-select pl-10"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </header>

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
                    <td className="table-cell">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-6 w-20 animate-pulse rounded-full bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end">
                        <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-300" />
                      </div>
                    </td>
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
              return (
                <tr key={payment._id} className="table-row">
                  <td className="table-cell-text font-mono text-sm">{payment.paymentNumber || payment._id.slice(0, 8)}</td>
                  <td className="table-cell-text">{getPaymentCustomerName(payment)}</td>
                  <td className="table-cell-text">{formatCurrency(payment.amount, payment.currency || 'KES')}</td>
                  <td className="table-cell">
                    <StatusBadge status={payment.method} type="payment-method" />
                  </td>
                  <td className="table-cell-text">{formatPaymentType(payment.type)}</td>
                  <td className="table-cell">
                    <StatusBadge status={payment.status} type="payment-status" />
                  </td>
                  <td className="table-cell-text">{formatDateTime(payment.createdAt)}</td>
                  <td className="table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/payments/${payment._id}`}
                        className="flex items-center justify-center rounded-lg bg-white p-2 text-blue-600 transition hover:bg-blue-50"
                        title="View payment"
                      >
                        <FiEye className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination - separate from table container */}
      {!isLoading && !isError && pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentList;
