// src/components/FooterReact.jsx
import { Link } from 'react-router-dom';
import '../styles/Components/FooterReact.css';

function FooterReact() {
  return (
    <footer className="footer-react">
      <div className="footer-content">
        <div className="footer-social">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <i className="bi bi-facebook"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <i className="bi bi-instagram"></i>
          </a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer">
            <i className="bi bi-twitter-x"></i>
          </a>
        </div>

        {/* Enlace a "Sobre Nosotros" */}
        <div className="footer-links">
          <Link to="/About" className="footer-link">
            Sobre Nosotros
          </Link>
        </div>

        <div className="footer-legal">
          <p>© 2025 TuExpertoCerca. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default FooterReact;
