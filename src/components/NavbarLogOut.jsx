import { useContext } from 'react';
import { Link  } from 'react-router-dom';
import '../styles/Components/NavbarLogOut.css';
import logo from '../assets/Logo2.png';
import ImageDropdown from './ImageDropdown'; // 👈 importa tu dropdown
import { AuthContext } from '../context/AuthContext'; // Importa el contexto

//navbar predeterminado para usuarios logueados

function NavbarLogOut() {

  const { user } = useContext(AuthContext);  // `user` es el valor del usuario logueado

  return (
    <nav className="navbar navbar-expand-lg custom-navbar px-3">
      <div className="container-fluid position-relative d-flex justify-content-between align-items-center">

        {/* Logo centrado */}
        <Link to="/home" className="navbar-brand logo-centered">
          <img src={logo} alt="Logo" className="logo-navbar" />
        </Link>

        {/* Mostrar ImageDropdown solo si hay un usuario logueado */}
        {user && (
          <div className="ms-auto">
            <ImageDropdown />
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavbarLogOut;
