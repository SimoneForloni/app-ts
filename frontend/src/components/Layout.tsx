export const Layout = ({ children }: { children: React.ReactNode}) => {
	return (
		<div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar Minimalista */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            The Nest
          </h1>
          <div className="flex gap-6 items-center">
            <button className="text-slate-600 hover:text-indigo-600 transition">Esplora</button>
            <button className="text-slate-600 hover:text-indigo-600 transition">I miei Progetti</button>
            <div className="h-10 w-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
              JD
            </div>
          </div>
        </div>
      </nav>

      {/* Area Contenuto */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
	)
}