/* Main App Component */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import MatriculaWizard from './pages/MatriculaWizard'
import CoordenadoraPainel from './pages/CoordenadoraPainel'
import PainelFinanceiro from './pages/PainelFinanceiro'
import PainelGrade from './pages/PainelGrade'
import PainelInadimplencia from './pages/PainelInadimplencia'
import PainelConsolidacao from './pages/PainelConsolidacao'
import PainelFases from './pages/PainelFases'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/matricula" element={<MatriculaWizard />} />
          <Route path="/coordenadora" element={<CoordenadoraPainel />} />
          <Route path="/financeiro" element={<PainelFinanceiro />} />
          <Route path="/grade" element={<PainelGrade />} />
          <Route path="/inadimplencia" element={<PainelInadimplencia />} />
          <Route path="/consolidacao" element={<PainelConsolidacao />} />
          <Route path="/fases" element={<PainelFases />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
