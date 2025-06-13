/**
 * ============================================
 *  PROYECTO DE TÍTULO - TuExpertoCerca.com
 * ============================================
 * Autores:
 * - Jatsury Génesis Neira Tapia       | RUT: [12345678-9]
 * - Lucas Francisco Altamirano Villarroel | RUT: [98765432-1]
 * 
 * Fecha         : [13/06/2025]
 * Asignatura    : Proyecto de Título
 * Profesor(a)   : [Sandra Cano Mazuera]
 * 
 * Institución   : [Pontificia Universidad Católica de Valparaíso]
 * 
 * ============================================
 */



import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavbarLogOut from './components/NavbarLogOut';
import Footer from './components/FooterReact';
import BotonAyuda from './components/BotonAyuda'

import Home from './pages/All/Home';
import Soporte from './pages/All/Soporte';
import ConfirmacionSoporte from './pages/All/ConfirmacionSoporte';
import FormularioReporteUsuario from './pages/All/FormularioReporteUsuario';
import BandejaEntrada from './pages/All/BandejaEntrada';

import RegisterUser from './pages/Cliente/RegisterUser';
import SearchServices from './pages/Cliente/SearchServices';
import ReporterUser from './pages/Cliente/ReporterUser';
import UserProfile from './pages/Cliente/UserProfile';
import UserEditProfile from './pages/Cliente/UserEditProfile';

import RegisterProvider from './pages/Prestador/RegisterProvider';
import ProviderProfile from './pages/Prestador/ProviderProfile';
import DetailProvider from './pages/Prestador/DetailProvider';

import MenuAdmin from './pages/Admin/MenuAdmin';
import GestionUsuarios from './pages/Admin/GestionUsuarios';
import ReportesFuncionamiento from './pages/Admin/ReportesFuncionamiento';
import ReportesUsuarios from './pages/Admin/ReportesUsuarios';
import AdminSetup from './services/AdminSetup'; 

import ConfirmarCuenta from './pages/All/ConfirmarCuenta';
import { AuthProvider } from './context/AuthContext';
import LoginPageWrapper from './pages/All/LoginPageWrapper'
import Inbox from './pages/All/Inbox'


function App() {
  useEffect(() => {
    console.log('API base URL →', process.env.REACT_APP_API_URL);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <NavbarLogOut />
        <main>
          <Routes>
            {/* Rutas generales */}
            <Route path="/" element={<LoginPageWrapper/>} />
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<SearchServices />} />
            <Route path="/soporte" element={<Soporte />} />
            <Route path="/reporte-enviado" element={<ConfirmacionSoporte />} />
            <Route path="/reportar-usuario" element={<FormularioReporteUsuario />} />
            <Route path="/bandeja" element={<BandejaEntrada />} />
            <Route path="/confirmar-cuenta/:token" element={<ConfirmarCuenta />} />

            {/* Rutas cliente */}
            <Route path="/registeruser" element={<RegisterUser />} />
            <Route path="/reporter/user" element={<ReporterUser />} />
            <Route path="/user/edit" element={<UserEditProfile />} />
            <Route path="/user/perfil/:id" element={<UserProfile />} />
            <Route path="/inbox" element={<Inbox />} />


            {/* Rutas proveedor */}
            <Route path="/registerprovider" element={<RegisterProvider />} />
            <Route exact  path="/provider/perfil" element={<ProviderProfile />} />
            <Route exact  path="/provider/detalle/:id" element={<DetailProvider />} />

            {/* Rutas admin */}
            <Route path="/CreateAdmin" element={<AdminSetup />} />
            <Route path="/admin" element={<MenuAdmin />} />
            <Route path="/admin/usuarios" element={<GestionUsuarios />} />
            <Route path="/admin/reportes-app" element={<ReportesFuncionamiento />} />
            <Route path="/admin/reportes-usuarios" element={<ReportesUsuarios />} />
          </Routes>
        </main>
        <BotonAyuda />
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
