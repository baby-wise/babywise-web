import React from 'react'
import './About.css'

function About() {
  return (
    <div className="about">
      <div className="about-header">
        <h1>Acerca de BabyWise</h1>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Nuestra Misión</h2>
          <p>
            BabyWise es una plataforma innovadora diseñada para ayudar a los padres
            a cuidar mejor de sus bebés utilizando tecnología inteligente y análisis
            en tiempo real.
          </p>
        </section>

        <section className="about-section">
          <h2>Características Principales</h2>
          <ul className="features-list">
            <li>Monitoreo de audio y video en tiempo real</li>
            <li>Análisis de patrones de sueño y llanto</li>
            <li>Grabación y reproducción de eventos importantes</li>
            <li>Gestión de grupos familiares</li>
            <li>Estadísticas detalladas del comportamiento del bebé</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Tecnología</h2>
          <p>
            Utilizamos las últimas tecnologías en inteligencia artificial,
            procesamiento de audio/video y comunicación en tiempo real para
            ofrecerte la mejor experiencia posible.
          </p>
        </section>
      </div>
    </div>
  )
}

export default About
