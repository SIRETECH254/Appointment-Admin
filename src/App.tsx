import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import NotFound from './routes/NotFound'
import Dashboard from './routes/protected/Dashboard'
import Layout from './routes/protected/Layout'
import AppointmentAdd from './routes/protected/appointments/AppointmentAdd'
import AppointmentDetails from './routes/protected/appointments/AppointmentDetails'
import AppointmentEdit from './routes/protected/appointments/AppointmentEdit'
import AppointmentList from './routes/protected/appointments/AppointmentList'
import ConfirmAppointment from './routes/protected/appointments/ConfirmAppointment'
import RescheduleAppointment from './routes/protected/appointments/RescheduleAppointment'
import FinishPayment from './routes/protected/appointments/FinishPayment'
import AvailabilityView from './routes/protected/availability/AvailabilityView'
import BreakAdd from './routes/protected/breaks/BreakAdd'
import BreakDetails from './routes/protected/breaks/BreakDetails'
import BreakEdit from './routes/protected/breaks/BreakEdit'
import BreakList from './routes/protected/breaks/BreakList'
import ContactDetails from './routes/protected/contact/ContactDetails'
import ContactList from './routes/protected/contact/ContactList'
import ContactReply from './routes/protected/contact/ContactReply'
import NotificationAdd from './routes/protected/notifications/NotificationAdd'
import NotificationDetails from './routes/protected/notifications/NotificationDetails'
import NotificationList from './routes/protected/notifications/NotificationList'
import NotificationSettings from './routes/protected/notifications/NotificationSettings'
import PaymentAdd from './routes/protected/payments/PaymentAdd'
import PaymentDetails from './routes/protected/payments/PaymentDetails'
import PaymentList from './routes/protected/payments/PaymentList'
import PaymentStatus from './routes/protected/payments/PaymentStatus'
import ServicePayment from './routes/protected/payments/ServicePayment'
import Profile from './routes/protected/profile/Profile'
import ProfileEdit from './routes/protected/profile/ProfileEdit'
import ProfileChangePassword from './routes/protected/payments/ProfileChangePassword'
import RoleAdd from './routes/protected/roles/RoleAdd'
import RoleDetails from './routes/protected/roles/RoleDetails'
import RoleEdit from './routes/protected/roles/RoleEdit'
import RoleList from './routes/protected/roles/RoleList'
import ServiceAdd from './routes/protected/services/ServiceAdd'
import ServiceDetails from './routes/protected/services/ServiceDetails'
import ServiceEdit from './routes/protected/services/ServiceEdit'
import ServiceList from './routes/protected/services/ServiceList'
import StaffAdd from './routes/protected/staff/StaffAdd'
import StaffDetails from './routes/protected/staff/StaffDetails'
import StaffEdit from './routes/protected/staff/StaffEdit'
import StaffList from './routes/protected/staff/StaffList'
import StaffSchedule from './routes/protected/staff/StaffSchedule'
import StoreConfig from './routes/protected/store/StoreConfig'
import StoreConfigEdit from './routes/protected/store/StoreConfigEdit'
import UserAdd from './routes/protected/users/UserAdd'
import UserDetails from './routes/protected/users/UserDetails'
import UserEdit from './routes/protected/users/UserEdit'
import UserList from './routes/protected/users/UserList'
import ForgotPassword from './routes/public/ForgotPassword'
import Login from './routes/public/Login'
import ResetPassword from './routes/public/ResetPassword'
import VerifyOtp from './routes/public/VerifyOtp'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route element={<Layout />}>
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        <Route
          path="/profile/change-password"
          element={<ProfileChangePassword />}
        />

        {/* Users */}
        <Route path="/users" element={<UserList />} />
        <Route path="/users/new" element={<UserAdd />} />
        <Route path="/users/:id" element={<UserDetails />} />
        <Route path="/users/:id/edit" element={<UserEdit />} />

        {/* Store Configuration */}
        <Route path="/store" element={<StoreConfig />} />
        <Route path="/store/edit" element={<StoreConfigEdit />} />

        {/* Breaks */}
        <Route path="/breaks" element={<BreakList />} />
        <Route path="/breaks/new" element={<BreakAdd />} />
        <Route path="/breaks/:id" element={<BreakDetails />} />
        <Route path="/breaks/:id/edit" element={<BreakEdit />} />

        {/* Appointments */}
        <Route path="/appointments" element={<AppointmentList />} />
        <Route path="/appointments/new" element={<AppointmentAdd />} />
        <Route path="/appointments/:id" element={<AppointmentDetails />} />
        <Route path="/appointments/:id/edit" element={<AppointmentEdit />} />
        <Route path="/appointments/:id/confirm" element={<ConfirmAppointment />} />
        <Route path="/appointments/:id/reschedule" element={<RescheduleAppointment />} />
        <Route path="/appointments/:id/finish-payment" element={<FinishPayment />} />

        {/* Payments */}
        <Route path="/payments" element={<PaymentList />} />
        <Route path="/payments/new" element={<PaymentAdd />} />
        <Route path="/payments/:id" element={<PaymentDetails />} />
        <Route path="/payments/service" element={<ServicePayment />} />
        <Route path="/payments/status" element={<PaymentStatus />} />

        {/* Roles */}
        <Route path="/roles" element={<RoleList />} />
        <Route path="/roles/new" element={<RoleAdd />} />
        <Route path="/roles/:id" element={<RoleDetails />} />
        <Route path="/roles/:id/edit" element={<RoleEdit />} />

        {/* Services */}
        <Route path="/services" element={<ServiceList />} />
        <Route path="/services/new" element={<ServiceAdd />} />
        <Route path="/services/:id" element={<ServiceDetails />} />
        <Route path="/services/:id/edit" element={<ServiceEdit />} />

        {/* Contact */}
        <Route path="/contact" element={<ContactList />} />
        <Route path="/contact/:id" element={<ContactDetails />} />
        <Route path="/contact/:id/reply" element={<ContactReply />} />

        {/* Notifications */}
        <Route path="/notifications" element={<NotificationList />} />
        <Route path="/notifications/new" element={<NotificationAdd />} />
        <Route
          path="/notifications/settings"
          element={<NotificationSettings />}
        />
        <Route
          path="/notifications/:id"
          element={<NotificationDetails />}
        />

        {/* Staff */}
        <Route path="/staff" element={<StaffList />} />
        <Route path="/staff/new" element={<StaffAdd />} />
        <Route path="/staff/:id" element={<StaffDetails />} />
        <Route path="/staff/:id/edit" element={<StaffEdit />} />
        <Route path="/staff/:id/schedule" element={<StaffSchedule />} />

        {/* Availability */}
        <Route path="/availability" element={<AvailabilityView />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
