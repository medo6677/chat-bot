import AdminSidebar from './AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-slate-950 text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-auto w-full">{children}</main>
    </div>
  )
}
