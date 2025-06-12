// src/pages/All/Home.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/PageStyles/Home.css';
import BarraDeBusqueda from '../../components/BarraDeBusqueda';
import BusquedaRapida from '../../components/BusquedaRapida';
import FiltroBusqueda from '../../components/FiltroBusqueda';
import PerfilesDestacados from '../../components/RenderizarPerfilesdestacados';
import imagen1 from '../../assets/ImagenCarrusel/Carrusel1.png';
import imagen2 from '../../assets/ImagenCarrusel/Carrusel2.png';
import imagen3 from '../../assets/ImagenCarrusel/Carrusel3.png';

function Home() {
  const navigate = useNavigate();

  // Este handler recibirá el término buscado desde BarraDeBusqueda
  // y redirigirá a /search?query=<término>
  const handleRedirectToSearch = (searchTerm) => {
    if (!searchTerm || typeof searchTerm !== 'string') return;
    const encoded = encodeURIComponent(searchTerm.trim());
    navigate(`/search?q=${encoded}`);
  };

  return (
    <div className="home-background">
      <div className="container mt-4">
        {/* Búsqueda + Filtro */}
        <div className="search-filter-wrapper">
          <BarraDeBusqueda onSearch={handleRedirectToSearch} />
          <FiltroBusqueda />
        </div>

        {/* Carrusel */}
        <div id="carouselHome" className="carousel slide my-4 carrusel-limitado" data-bs-ride="carousel">
          <div className="carousel-inner rounded shadow-sm">
            <div className="carousel-item active">
              <img src={imagen1} className="d-block w-100" alt="Imagen 1" />
            </div>
            <div className="carousel-item">
              <img src={imagen2} className="d-block w-100" alt="Imagen 2" />
            </div>
            <div className="carousel-item">
              <img src={imagen3} className="d-block w-100" alt="Imagen 3" />
            </div>
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselHome"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Anterior</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselHome"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Siguiente</span>
          </button>
        </div>

        {/* Búsqueda rápida */}
        <div className="mb-5">
          <BusquedaRapida />
        </div>

        {/* Perfiles destacados dinámicos */}
        <section className="mb-4">
          <h2 className="mb-3 text-center">Perfiles Destacados</h2>
          <div className="row justify-content-center">
            <PerfilesDestacados />
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
