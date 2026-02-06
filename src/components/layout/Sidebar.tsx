import { NavLink } from 'react-router-dom'
import { MdLogout } from 'react-icons/md'
import { NAV_ITEMS } from '../../constants/navigation'
import { useAuth } from '../../contexts/AuthContext'

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { logout } = useAuth()

  // Shared sidebar content for desktop + mobile drawer.
  const content = (
    <div className="flex h-full flex-col bg-white px-4 pb-6 pt-6">
      {/* Logo + app name */}
      {/* <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white">
          <span className="text-sm font-semibold">AA</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Appointment Admin
          </p>
          <p className="text-xs text-gray-500">Navigation</p>
        </div>
      </div> */}

      {/* Primary navigation links */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  isActive
                    ? 'bg-brand-tint text-brand-primary'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              onClick={onClose}
              end={item.end ?? true}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Footer action: logout */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => void logout()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white hover:bg-brand-accent"
        >
          <MdLogout size={18} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-full w-1/4 border-r border-gray-200 bg-white lg:block">
        {content}
      </aside>
      {/* Mobile backdrop */}
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          aria-label="Close sidebar"
        />
      )}
      {/* Mobile drawer */}
      {isOpen && (
        <aside className="fixed left-0 top-0 z-40 h-full w-72 border-r border-gray-200 bg-white shadow-xl lg:hidden">
          {content}
        </aside>
      )}
    </>
  )
}

export default Sidebar
