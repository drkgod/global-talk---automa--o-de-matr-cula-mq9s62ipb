import { Outlet, Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Menu, X, GraduationCap } from 'lucide-react'

export default function Layout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/matricula', label: 'Matrícula' },
    { href: '/coordenadora', label: 'Coordenadora' },
    { href: '/financeiro', label: 'Financeiro' },
    { href: '/grade', label: 'Grade' },
    { href: '/inadimplencia', label: 'Inadimplência' },
  ]

  return (
    <main className="flex flex-col min-h-screen bg-gt-surface">
      <header className="sticky top-0 z-50 bg-white border-b border-gt-outline-variant">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gt-primary-container flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gt-on-surface">Global Talk</span>
              <span className="hidden sm:inline text-xs text-gt-outline ml-2">Gestão Escolar</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  location.pathname === item.href
                    ? 'bg-gt-primary-container text-white shadow-sm'
                    : 'text-gt-on-surface-variant hover:bg-gt-surface-container hover:text-gt-on-surface',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gt-surface-container transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-5 h-5 text-gt-on-surface" />
            ) : (
              <Menu className="w-5 h-5 text-gt-on-surface" />
            )}
          </button>
        </div>

        {menuOpen && (
          <nav className="lg:hidden border-t border-gt-outline-variant bg-white px-4 py-3 space-y-1 animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-lg text-sm font-medium transition-all',
                  location.pathname === item.href
                    ? 'bg-gt-primary-container text-white'
                    : 'text-gt-on-surface-variant hover:bg-gt-surface-container',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <div className="flex-1">
        <Outlet />
      </div>

      <footer className="border-t border-gt-outline-variant bg-white py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-gt-outline">© 2026 Global Talk</p>
        </div>
      </footer>
    </main>
  )
}
