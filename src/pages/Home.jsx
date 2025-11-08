import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Tilt from 'react-parallax-tilt';
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

// Component for Features with scroll animations
const FeaturesSectionWithAnimation = ({ features }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="section features-section" ref={ref}>
      <div className="section-content">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Tecnología que marca la diferencia
        </motion.h2>
        <motion.p 
          className="section-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Características diseñadas para darte tranquilidad absoluta
        </motion.p>
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Tilt
                tiltMaxAngleX={10}
                tiltMaxAngleY={10}
                scale={1.05}
                transitionSpeed={2000}
              >
                <div className="feature-card">
                  <motion.div 
                    className="feature-icon"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Component for Pricing with scroll animations
const PricingSectionWithAnimation = ({ pricing, navigate }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="section pricing-section" ref={ref}>
      <div className="section-content">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Planes para cada familia
        </motion.h2>
        <motion.p 
          className="section-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Comienza gratis, actualiza cuando lo necesites
        </motion.p>
        <div className="pricing-grid">
          {pricing.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Tilt
                tiltMaxAngleX={5}
                tiltMaxAngleY={5}
                scale={plan.highlight ? 1.05 : 1.02}
                transitionSpeed={2000}
              >
                <motion.div 
                  className={`pricing-card ${plan.highlight ? 'highlight' : ''}`}
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {plan.highlight && <div className="badge">Más popular</div>}
                  <h3>{plan.name}</h3>
                  <motion.div 
                    className="price"
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200, 
                      delay: 0.3 + index * 0.15 
                    }}
                  >
                    {plan.price}
                  </motion.div>
                  <ul className="features-list">
                    {plan.features.map((feature, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.4 + index * 0.15 + i * 0.05 }}
                      >
                        <motion.div
                          className="check-icon-wrapper"
                          whileHover={{ scale: 1.3, rotate: 360 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <MdCheckCircle />
                        </motion.div>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                  <motion.button 
                    className={`btn ${plan.highlight ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => navigate('/groups')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {plan.price === "Gratis" ? "Comenzar ahora" : "Elegir plan"}
                  </motion.button>
                </motion.div>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Component for Problem Section with scroll animations
const ProblemSectionWithAnimation = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const problems = [
    {
      title: "Noches sin dormir",
      description: "Levantarse constantemente para revisar al bebé te agota física y mentalmente"
    },
    {
      title: "Ansiedad constante",
      description: "La preocupación por tu bebé no te deja concentrarte en el trabajo o descansar"
    },
    {
      title: "Monitores básicos",
      description: "Los sistemas tradicionales no ofrecen la calidad ni las funciones que necesitas"
    },
    {
      title: "Costos elevados",
      description: "Soluciones profesionales con precios inaccesibles y contratos largos"
    }
  ];

  return (
    <section className="section problem-section" ref={ref}>
      <div className="section-content">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          El problema que resolvemos
        </motion.h2>
        <div className="problem-grid">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div 
                className="problem-card"
                whileHover={{ y: -5, boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3>{problem.title}</h3>
                <p>{problem.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

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
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="hero-badge"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div 
              className="badge-icon"
              whileHover={{ scale: 1.2, rotate: 360 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MdStars />
            </motion.div>
            Monitoreo inteligente con IA
          </motion.div>
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Un asistente siempre atento,
            <br />
            <span className="gradient-text">para que vos descanses</span>
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            El monitor inteligente que revoluciona el cuidado infantil con IA, 
            streaming de alta calidad y análisis en tiempo real
          </motion.p>
          <motion.div 
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.button 
              className="btn btn-primary"
              onClick={() => navigate('/groups')}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(63, 200, 175, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              Comenzar gratis
              <MdArrowForward />
            </motion.button>
            <motion.button 
              className="btn btn-secondary"
              onClick={() => navigate('/about')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Conocer más
            </motion.button>
          </motion.div>
          <motion.div 
            className="hero-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {[
              { value: "50K+", label: "Familias confiando" },
              { value: "4.9/5", label: "Calificación promedio" },
              { value: "99.9%", label: "Tiempo activo" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="stat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
              >
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, x: 50, rotateY: -15 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        >
          <Tilt
            tiltMaxAngleX={5}
            tiltMaxAngleY={5}
            scale={1.02}
            transitionSpeed={2000}
          >
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="mockup-content">
                  <motion.img 
                    src="/babywise-logo.png" 
                    alt="BabyWise Logo" 
                    className="mockup-logo"
                    animate={{ 
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </div>
            </div>
          </Tilt>
        </motion.div>
      </section>

      {/* Problem Section */}
      <ProblemSectionWithAnimation />

      {/* Features Section */}
      <FeaturesSectionWithAnimation features={features} />
      

      {/* Benefits Section */}
      <section className="section benefits-section">
        <div className="section-content">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="section-title">Todo lo que necesitas en un solo lugar</h2>
              <ul className="benefits-list">
                {benefits.map((benefit, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      className="check-icon-wrapper"
                      whileHover={{ scale: 1.3, rotate: 360 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <MdCheckCircle className="check-icon" />
                    </motion.div>
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="benefits-visual">
              <div className="device-showcase">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <MdDevices className="device-icon" />
                </motion.div>
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
            <motion.div 
              className="step"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="step-number"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                1
              </motion.div>
              <h3>Descarga</h3>
              <p>Instala la app en tu teléfono o accede desde el navegador</p>
            </motion.div>
            <motion.div 
              className="step-arrow"
              whileHover={{ scale: 1.3, x: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MdArrowForward />
            </motion.div>
            <motion.div 
              className="step"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="step-number"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                2
              </motion.div>
              <h3>Configura</h3>
              <p>Crea tu cuenta y conecta tus dispositivos en minutos</p>
            </motion.div>
            <motion.div 
              className="step-arrow"
              whileHover={{ scale: 1.3, x: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MdArrowForward />
            </motion.div>
            <motion.div 
              className="step"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="step-number"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                3
              </motion.div>
              <h3>Monitorea</h3>
              <p>Disfruta de tranquilidad 24/7 con nuestro sistema inteligente</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonials-section">
        <div className="section-content">
          <h2 className="section-title">Lo que dicen nuestras familias</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index} 
                className="testimonial-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="star-wrapper"
                      whileHover={{ scale: 1.3, rotate: 360 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <MdStars />
                    </motion.div>
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSectionWithAnimation pricing={pricing} navigate={navigate} />

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
