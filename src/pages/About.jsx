import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Tilt from 'react-parallax-tilt';
import { 
  MdRocketLaunch, 
  MdLightbulb, 
  MdGroups, 
  MdSecurity,
  MdCloud,
  MdSmartToy,
  MdVideoLibrary,
  MdAnalytics
} from 'react-icons/md';
import './About.css';

const About = () => {
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [missionRef, missionInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [valuesRef, valuesInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [techRef, techInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [teamRef, teamInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const values = [
    {
      icon: <MdLightbulb />,
      title: "Innovación",
      description: "Siempre buscando nuevas formas de mejorar el cuidado infantil"
    },
    {
      icon: <MdSecurity />,
      title: "Seguridad",
      description: "Tu privacidad y la de tu familia son nuestra prioridad"
    },
    {
      icon: <MdGroups />,
      title: "Comunidad",
      description: "Construyendo una red de apoyo para padres"
    },
    {
      icon: <MdRocketLaunch />,
      title: "Evolución",
      description: "Mejorando constantemente con tu feedback"
    }
  ];

  const technologies = [
    {
      icon: <MdSmartToy />,
      title: "Inteligencia Artificial",
      description: "Detección avanzada de patrones y comportamientos"
    },
    {
      icon: <MdVideoLibrary />,
      title: "Streaming HD",
      description: "Video en tiempo real con calidad profesional"
    },
    {
      icon: <MdCloud />,
      title: "Cloud Computing",
      description: "Almacenamiento seguro y accesible desde cualquier lugar"
    },
    {
      icon: <MdAnalytics />,
      title: "Big Data Analytics",
      description: "Análisis detallados para entender mejor a tu bebé"
    }
  ];

  const team = [
    {
      name: "Equipo de Desarrollo",
      role: "Ingenieros apasionados por la tecnología y la familia",
      description: "Trabajamos día a día para crear la mejor experiencia posible"
    },
    {
      name: "Equipo de Producto",
      role: "Diseñadores y especialistas en UX",
      description: "Creamos interfaces intuitivas que todos puedan usar"
    },
    {
      name: "Soporte",
      role: "Siempre disponibles para ayudarte",
      description: "Respuestas rápidas y soluciones efectivas para todas tus dudas"
    }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero" ref={heroRef}>
        <motion.div 
          className="about-hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="about-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div 
              className="badge-icon"
              whileHover={{ scale: 1.2, rotate: 360 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MdRocketLaunch />
            </motion.div>
            Acerca de nosotros
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Revolucionando el <span className="gradient-text">cuidado infantil</span>
          </motion.h1>
          <motion.p
            className="about-hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Somos un equipo dedicado a usar la tecnología para dar tranquilidad a las familias
          </motion.p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="about-section mission-section" ref={missionRef}>
        <div className="about-section-content">
          <motion.div
            className="mission-grid"
            initial={{ opacity: 0 }}
            animate={missionInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="mission-text"
              initial={{ opacity: 0, x: -50 }}
              animate={missionInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <h2>Nuestra Misión</h2>
              <p>
                En BabyWise, creemos que todos los padres merecen dormir tranquilos. 
                Nuestra misión es combinar tecnología de vanguardia con diseño intuitivo 
                para crear el monitor de bebés más completo y confiable del mercado.
              </p>
              <p>
                No somos solo un producto, somos una comunidad de padres, desarrolladores 
                y expertos en cuidado infantil trabajando juntos para hacer la paternidad 
                un poco más fácil cada día.
              </p>
            </motion.div>
            <motion.div
              className="mission-visual"
              initial={{ opacity: 0, x: 50 }}
              animate={missionInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="mission-stats">
                <motion.div 
                  className="stat-card"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  <h3>50K+</h3>
                  <p>Familias activas</p>
                </motion.div>
                <motion.div 
                  className="stat-card"
                  whileHover={{ scale: 1.05, rotate: -2 }}
                >
                  <h3>4.9/5</h3>
                  <p>Calificación</p>
                </motion.div>
                <motion.div 
                  className="stat-card"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  <h3>24/7</h3>
                  <p>Soporte</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-section values-section" ref={valuesRef}>
        <div className="about-section-content">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Nuestros Valores
          </motion.h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Tilt
                  tiltMaxAngleX={8}
                  tiltMaxAngleY={8}
                  scale={1.05}
                  transitionSpeed={2000}
                >
                  <div className="value-card">
                    <motion.div 
                      className="value-icon"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {value.icon}
                    </motion.div>
                    <h3>{value.title}</h3>
                    <p>{value.description}</p>
                  </div>
                </Tilt>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="about-section tech-section" ref={techRef}>
        <div className="about-section-content">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            animate={techInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Tecnología de Vanguardia
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={techInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Las mejores herramientas para el mejor cuidado
          </motion.p>
          <div className="tech-grid">
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={techInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.15, duration: 0.5 }}
              >
                <motion.div 
                  className="tech-card"
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div 
                    className="tech-icon"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {tech.icon}
                  </motion.div>
                  <h3>{tech.title}</h3>
                  <p>{tech.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-section team-section" ref={teamRef}>
        <div className="about-section-content">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            animate={teamInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Nuestro Equipo
          </motion.h2>
          <div className="team-grid">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={teamInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <Tilt
                  tiltMaxAngleX={5}
                  tiltMaxAngleY={5}
                  scale={1.02}
                  transitionSpeed={2000}
                >
                  <div className="team-card">
                    <h3>{member.name}</h3>
                    <p className="team-role">{member.role}</p>
                    <p className="team-description">{member.description}</p>
                  </div>
                </Tilt>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <motion.div
          className="about-cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2>¿Listo para unirte a nosotros?</h2>
          <p>Miles de familias ya confían en BabyWise para cuidar lo que más aman</p>
          <motion.button
            className="cta-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/groups'}
          >
            Comenzar ahora
          </motion.button>
        </motion.div>
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
            <a href="/#features">Características</a>
            <a href="/#pricing">Precios</a>
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

export default About;
