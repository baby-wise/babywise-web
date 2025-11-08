import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdBabyChangingStation, 
  MdVideocam, 
  MdNotifications, 
  MdInsertChart,
  MdCheckCircle,
  MdArrowForward,
  MdSecurity,
  MdCloud,
  MdDevices,
  MdStars
} from 'react-icons/md';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <MdVideocam />,
      title: "Monitoreo 24/7",
      description: "Video en tiempo real de alta calidad desde cualquier dispositivo"
    },
    {
      icon: <MdNotifications />,
      title: "Alertas Inteligentes",
      description: "IA detecta llanto y movimientos inusuales, notificándote al instante"
    },
    {
      icon: <MdInsertChart />,
      title: "Análisis Detallado",
      description: "Estadísticas de sueño, patrones y comportamiento de tu bebé"
    },
    {
      icon: <MdSecurity />,
      title: "100% Seguro",
      description: "Encriptación de extremo a extremo para proteger a tu familia"
    }
  ];

  const benefits = [
    "Monitoreo desde múltiples dispositivos simultáneamente",
    "Grabación automática en la nube de eventos importantes",
    "Comunicación bidireccional para calmar a tu bebé",
    "Visión nocturna y zoom de alta definición",
    "Compartir acceso con familiares de confianza",
    "Sin contratos ni tarifas ocultas"
  ];

  const testimonials = [
    {
      name: "María González",
      role: "Madre de 2",
      text: "BabyWise me ha dado la tranquilidad que necesitaba. Puedo trabajar desde casa sabiendo que mi bebé está seguro."
    },
    {
      name: "Carlos Rodríguez",
      role: "Padre primerizo",
      text: "La detección de llanto con IA es increíble. Me avisa incluso antes de que el llanto sea fuerte."
    },
    {
      name: "Ana Martínez",
      role: "Pediatra",
      text: "Recomiendo BabyWise a todos mis pacientes. Las estadísticas de sueño son muy útiles para el seguimiento."
    }
  ];

  const pricing = [
    {
      name: "Básico",
      price: "Gratis",
      features: [
        "1 cámara activa",
        "Streaming en vivo",
        "Notificaciones básicas",
        "Grabación de 24 horas"
      ],
      highlight: false
    },
    {
      name: "Premium",
      price: "$2.99/mes",
      features: [
        "Cámaras ilimitadas",
        "Grabación en la nube 30 días",
        "IA de detección avanzada",
        "Análisis detallados",
        "Soporte prioritario"
      ],
      highlight: true
    },
    {
      name: "Familiar",
      price: "$4.99/mes",
      features: [
        "Todo Premium +",
        "Hasta 10 usuarios",
        "Almacenamiento ilimitado",
        "Consultas pediátricas virtuales",
        "Sin anuncios"
      ],
      highlight: false
    }
  ];

  return (
    <div className="home-container">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <MdStars /> Tecnología de vanguardia
          </div>
          <h1 className="hero-title">
            Un asistente siempre atento,
            <br />
            <span className="gradient-text">para que vos descanses</span>
          </h1>
          <p className="hero-subtitle">
            El monitor inteligente que revoluciona el cuidado infantil con IA, 
            streaming de alta calidad y análisis en tiempo real
          </p>
          <div className="hero-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/groups')}
            >
              Comenzar gratis
              <MdArrowForward />
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/about')}
            >
              Conocer más
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <h3>50K+</h3>
              <p>Familias confiando</p>
            </div>
            <div className="stat">
              <h3>4.9/5</h3>
              <p>Calificación promedio</p>
            </div>
            <div className="stat">
              <h3>99.9%</h3>
              <p>Tiempo activo</p>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="mockup-content">
                <img 
                  src="/babywise-logo.png" 
                  alt="BabyWise Logo" 
                  className="mockup-logo"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="section problem-section">
        <div className="section-content">
          <h2 className="section-title">El problema que resolvemos</h2>
          <div className="problem-grid">
            <div className="problem-card">
              <h3>Noches sin dormir</h3>
              <p>Levantarse constantemente para revisar al bebé te agota física y mentalmente</p>
            </div>
            <div className="problem-card">
              <h3>Ansiedad constante</h3>
              <p>La preocupación por tu bebé no te deja concentrarte en el trabajo o descansar</p>
            </div>
            <div className="problem-card">
              <h3>Monitores básicos</h3>
              <p>Los sistemas tradicionales no ofrecen la calidad ni las funciones que necesitas</p>
            </div>
            <div className="problem-card">
              <h3>Costos elevados</h3>
              <p>Soluciones profesionales con precios inaccesibles y contratos largos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features-section">
        <div className="section-content">
          <h2 className="section-title">Tecnología que marca la diferencia</h2>
          <p className="section-subtitle">
            Características diseñadas para darte tranquilidad absoluta
          </p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section benefits-section">
        <div className="section-content">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="section-title">Todo lo que necesitas en un solo lugar</h2>
              <ul className="benefits-list">
                {benefits.map((benefit, index) => (
                  <li key={index}>
                    <MdCheckCircle className="check-icon" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="benefits-visual">
              <div className="device-showcase">
                <MdDevices className="device-icon" />
                <p>Compatible con iOS, Android y navegadores web</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section how-it-works">
        <div className="section-content">
          <h2 className="section-title">Comienza en 3 simples pasos</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Descarga</h3>
              <p>Instala la app en tu teléfono o accede desde el navegador</p>
            </div>
            <div className="step-arrow">
              <MdArrowForward />
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Configura</h3>
              <p>Crea tu cuenta y conecta tus dispositivos en minutos</p>
            </div>
            <div className="step-arrow">
              <MdArrowForward />
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Monitorea</h3>
              <p>Disfruta de tranquilidad 24/7 con nuestro sistema inteligente</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonials-section">
        <div className="section-content">
          <h2 className="section-title">Lo que dicen nuestras familias</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <MdStars key={i} />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section pricing-section">
        <div className="section-content">
          <h2 className="section-title">Planes para cada familia</h2>
          <p className="section-subtitle">
            Comienza gratis, actualiza cuando lo necesites
          </p>
          <div className="pricing-grid">
            {pricing.map((plan, index) => (
              <div 
                key={index} 
                className={`pricing-card ${plan.highlight ? 'highlight' : ''}`}
              >
                {plan.highlight && <div className="badge">Más popular</div>}
                <h3>{plan.name}</h3>
                <div className="price">{plan.price}</div>
                <ul className="features-list">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <MdCheckCircle />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  className={`btn ${plan.highlight ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => navigate('/groups')}
                >
                  {plan.price === "Gratis" ? "Comenzar ahora" : "Elegir plan"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section cta-section">
        <div className="section-content">
          <div className="cta-content">
            <h2>¿Listo para dormir tranquilo?</h2>
            <p>Únete a miles de familias que ya confían en BabyWise</p>
            <button 
              className="btn btn-primary btn-large"
              onClick={() => navigate('/groups')}
            >
              Comenzar gratis ahora
              <MdArrowForward />
            </button>
            <p className="cta-note">
              <MdCloud /> No se requiere tarjeta de crédito
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>BabyWise</h4>
            <p>Tecnología al servicio del cuidado infantil</p>
          </div>
          <div className="footer-section">
            <h4>Producto</h4>
            <a href="#features">Características</a>
            <a href="#pricing">Precios</a>
            <a href="/about">Nosotros</a>
          </div>
          <div className="footer-section">
            <h4>Soporte</h4>
            <a href="#faq">Preguntas frecuentes</a>
            <a href="#contact">Contacto</a>
            <a href="#help">Centro de ayuda</a>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <a href="#privacy">Privacidad</a>
            <a href="#terms">Términos</a>
            <a href="#security">Seguridad</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 BabyWise. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
