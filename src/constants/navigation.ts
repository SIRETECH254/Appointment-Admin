import type { IconType } from 'react-icons'
import {
  MdAccessTime,
  MdAccountCircle,
  MdAssignment,
  MdCalendarMonth,
  MdDashboard,
  MdEventNote,
  MdGroup,
  MdLocalAtm,
  MdMailOutline,
  MdNotificationsNone,
  MdPeopleAlt,
  MdRoomService,
  MdStorefront,
} from 'react-icons/md'

export type NavItem = {
  label: string
  path: string
  icon: IconType
  end?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: MdDashboard, end: true },
  { label: 'Profile', path: '/profile', icon: MdAccountCircle, end: true },
  { label: 'Users', path: '/users', icon: MdGroup, end: true },
  { label: 'Store', path: '/store', icon: MdStorefront, end: true },
  { label: 'Breaks', path: '/breaks', icon: MdAccessTime, end: true },
  {
    label: 'Appointments',
    path: '/appointments',
    icon: MdCalendarMonth,
    end: true,
  },
  { label: 'Payments', path: '/payments', icon: MdLocalAtm, end: true },
  { label: 'Roles', path: '/roles', icon: MdAssignment, end: true },
  { label: 'Services', path: '/services', icon: MdRoomService, end: true },
  { label: 'Contact', path: '/contact', icon: MdMailOutline, end: true },
  {
    label: 'Notifications',
    path: '/notifications',
    icon: MdNotificationsNone,
    end: true,
  },
  { label: 'Staff', path: '/staff', icon: MdPeopleAlt, end: true },
  {
    label: 'Availability',
    path: '/availability',
    icon: MdEventNote,
    end: true,
  },
]
