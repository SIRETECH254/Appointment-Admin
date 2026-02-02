import { useAuth } from '../../contexts/AuthContext'

const Dashboard = () => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Appointment Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Welcome{user ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="mt-2 text-slate-300">
            You are signed in. This placeholder can be replaced with the full
            admin layout later.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="w-fit rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

export default Dashboard
