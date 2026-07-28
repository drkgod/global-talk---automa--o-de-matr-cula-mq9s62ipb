import { Outlet, Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function Layout() {
  const location = useLocation()
  const navItems = [
    { href: '/', label: 'Início' },
    { href: '/matricula', label: 'Nova Matrícula' },
    { href: '/coordenadora', label: 'Coordenadora' },
    { href: '/fases', label: 'Fases' },
  ]

  return (
    <main className="flex flex-col min-h-screen">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600">Global Talk</span>
            <span className="text-xs text-gray-500 hidden sm:inline">Automação de Matrícula</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  location.pathname === item.href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <Outlet />
    </main>
  )
}
