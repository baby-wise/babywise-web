import { lazy } from 'react'

// Lazy loading de páginas para mejor performance
const Home = lazy(() => import('../pages/Home'))
const About = lazy(() => import('../pages/About'))

// Configuración de rutas
export const routes = [
  {
    path: '/',
    element: Home,
    name: 'Inicio',
    showInNav: true,
  },
  {
    path: '/about',
    element: About,
    name: 'Acerca de',
    showInNav: true,
  },
  // Agrega más rutas aquí:
  // {
  //   path: '/dashboard',
  //   element: Dashboard,
  //   name: 'Dashboard',
  //   showInNav: true,
  // },
]

// Rutas que aparecen en la navegación
export const navRoutes = routes.filter(route => route.showInNav)

export default routes
