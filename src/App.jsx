import { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { routes, navRoutes } from './routes/routes'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="logo">BabyWise Web</h1>
            <ul className="nav-links">
              {navRoutes.map((route) => (
                <li key={route.path}>
                  <Link to={route.path}>{route.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Suspense fallback={
            <div className="loading-container">
              <div className="loading"></div>
              <p>Cargando...</p>
            </div>
          }>
            <Routes>
              {routes.map((route) => {
                const Component = route.element
                return (
                  <Route 
                    key={route.path} 
                    path={route.path} 
                    element={<Component />} 
                  />
                )
              })}
            </Routes>
          </Suspense>
        </main>

        <footer className="footer">
          <p>&copy; 2025 BabyWise. Todos los derechos reservados.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
