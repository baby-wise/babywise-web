import React from 'react'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>Bienvenido a BabyWise Web</h1>
        <p className="subtitle">Tu compañero inteligente para el cuidado del bebé</p>
      </div>

      <div className="features">
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Estadísticas</h3>
          <p>Monitorea el desarrollo de tu bebé con gráficos y análisis detallados.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🎥</div>
          <h3>Monitoreo en Vivo</h3>
          <p>Observa a tu bebé en tiempo real desde cualquier dispositivo.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔔</div>
          <h3>Alertas Inteligentes</h3>
          <p>Recibe notificaciones cuando tu bebé necesite atención.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">👥</div>
          <h3>Grupos Familiares</h3>
          <p>Comparte el acceso con familiares y cuidadores de confianza.</p>
        </div>
      </div>
    </div>
  )
}

export default Home
