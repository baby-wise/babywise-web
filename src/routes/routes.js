import { lazy } from 'react'

// Lazy loading de páginas para mejor performance
const Home = lazy(() => import('../pages/Home'))
const About = lazy(() => import('../pages/About'))
const HomeGroups = lazy(() => import('../pages/HomeGroups'))
const GroupOptions = lazy(() => import('../pages/GroupOptions'))
const Viewer = lazy(() => import('../pages/Viewer'))

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
  {
    path: '/groups',
    element: HomeGroups,
    name: 'Mis Grupos',
    showInNav: true,
  },
  {
    path: '/group/:groupId',
    element: GroupOptions,
    name: 'Opciones de Grupo',
    showInNav: false,
  },
  {
    path: '/viewer/:groupId/:cameraName',
    element: Viewer,
    name: 'Visor de Cámara',
    showInNav: false,
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
