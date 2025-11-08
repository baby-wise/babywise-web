import { Suspense, useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { routes, navRoutes } from './routes/routes'
import { auth } from './config/firebase'
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { SocketProvider } from './contexts/SocketContext.jsx'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [displayEmail, setDisplayEmail] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Verificar estado de autenticación
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true)
        setDisplayEmail(user.email)
      } else {
        setIsLoggedIn(false)
        setDisplayEmail(null)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleSignIn = async () => {
    if (!isLoggedIn) {
      setIsLoading(true)
      try {
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth, provider)
        setIsLoggedIn(true)
        setDisplayEmail(result.user.email)
        setShowProfileMenu(false)
      } catch (error) {
        console.log('Sign in error:', error)
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
          alert(`Error al iniciar sesión: ${error.message}`)
        }
      }
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut(auth)
      setDisplayEmail(null)
      setIsLoggedIn(false)
      setShowProfileMenu(false)
    } catch (error) {
      console.error('Sign out error:', error)
    }
    setIsLoading(false)
  }

  const getUserName = () => {
    if (!displayEmail) return 'Usuario'
    return displayEmail.split('@')[0]
  }

  return (
    <SocketProvider>
      <Router>
        <div className="app">
          <nav className="navbar">
            <div className="nav-container">
              <Link to="/" className="logo-link">
                <h1 className="logo">BabyWise</h1>
              </Link>
              <div className="nav-right">
                <ul className="nav-links">
                  {navRoutes.map((route) => (
                    <li key={route.path}>
                      <Link to={route.path}>{route.name}</Link>
                    </li>
                  ))}
                </ul>
              
              {/* Ícono de perfil en navbar */}
              <div className="nav-profile">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`nav-profile-icon ${isLoggedIn ? 'logged-in' : ''}`}
                  aria-label="Perfil"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                </button>
                
                {/* Menú desplegable de perfil */}
                {showProfileMenu && (
                  <div className="nav-profile-menu">
                    {isLoggedIn ? (
                      <>
                        <div className="nav-profile-username">
                          {getUserName()}
                        </div>
                        <button
                          onClick={handleSignOut}
                          disabled={isLoading}
                          className="nav-profile-item logout"
                        >
                          {isLoading ? <div className="loading-small"></div> : 'Cerrar Sesión'}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="nav-profile-message">
                          No has iniciado sesión
                        </div>
                        <button
                          onClick={handleSignIn}
                          disabled={isLoading}
                          className="nav-profile-login"
                        >
                          {isLoading ? <div className="loading-small"></div> : 'Iniciar Sesión'}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
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
      </div>
    </Router>
    </SocketProvider>
  )
}

export default App
