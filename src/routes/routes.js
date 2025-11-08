import { lazy } from 'react'

// Lazy loading de páginas para mejor performance
const Home = lazy(() => import('../pages/Home'))
const About = lazy(() => import('../pages/About'))
const HomeGroups = lazy(() => import('../pages/HomeGroups'))
const GroupOptions = lazy(() => import('../pages/GroupOptions'))
const Viewer = lazy(() => import('../pages/Viewer'))
const AudioList = lazy(() => import('../pages/AudioList'))
const RecordingsList = lazy(() => import('../pages/RecordingsList'))
const RecordingPlayer = lazy(() => import('../pages/RecordingPlayer'))
const Camera = lazy(() => import('../pages/Camera'))

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
  {
    path: '/audios/:groupId',
    element: AudioList,
    name: 'Lista de Audios',
    showInNav: false,
  },
  {
    path: '/recordings/:groupId',
    element: RecordingsList,
    name: 'Lista de Grabaciones',
    showInNav: false,
  },
  {
    path: '/recording/:groupId',
    element: RecordingPlayer,
    name: 'Reproductor de Grabación',
    showInNav: false,
  },
  {
    path: '/camera/:groupId/:cameraName',
    element: Camera,
    name: 'Cámara',
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
