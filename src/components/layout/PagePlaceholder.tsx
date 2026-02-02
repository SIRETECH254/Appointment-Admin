type PagePlaceholderProps = {
  title: string
  description?: string
}

const PagePlaceholder = ({ title, description }: PagePlaceholderProps) => {
  return (
    <section className="w-full">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
          Appointment Admin
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">
          {description ??
            'This page is ready for the full UI. Content will be added next.'}
        </p>
      </div>
    </section>
  )
}

export default PagePlaceholder
