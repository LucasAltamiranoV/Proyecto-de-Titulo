import '../../styles/Components/Valoracion.css';  // Asegúrate de que esta ruta sea correcta para los estilos

/**
 * Valoracion
 * Muestra una calificación de 0 a 5 usando estrellas.
 * Props:
 *  - rating: número (puede ser entero o decimal) entre 0 y 5
 *  - maxRating: número máximo de estrellas (por defecto 5)
 *  - onRate: callback cuando el usuario hace clic en una estrella (opcional)
 *  - readOnly: si es true, las estrellas no son clicables
 *  - isSelfRating: si es true, el usuario no podrá calificar a sí mismo
 */
export const Valoracion = ({
  rating = 0,
  maxRating = 5,
  onRate,
  readOnly = false,
  currentUserId,
  providerId
}) => {
  const stars = [];
  const floor = Math.floor(rating);
  const half = rating % 1 >= 0.5;

  // Determina si el usuario puede calificar (no se puede calificar a sí mismo)
  const isReadOnly = currentUserId === providerId || readOnly;

  // Generar estrellas
  for (let i = 1; i <= maxRating; i++) {
    let iconClass;
    if (i <= floor) {
      iconClass = 'bi-star-fill';  // Estrella llena
    } else if (i === floor + 1 && half) {
      iconClass = 'bi-star-half';  // Estrella media si es decimal
    } else {
      iconClass = 'bi-star';      // Estrella vacía
    }

    stars.push(
      <button
        key={i}
        type="button"
        className="btn btn-link p-0 me-1 text-warning"
        onClick={() => !isReadOnly && onRate && onRate(i)}  // Solo permite clic si no es solo lectura
        style={{ fontSize: '2rem', lineHeight: 1 }}
        disabled={isReadOnly}
      >
        <i className={`bi ${iconClass}`} />
      </button>
    );
  }

  return <div className="d-flex align-items-center">{stars}</div>;
};
