

/**
 * Componente genérico de etiqueta + input usando Bootstrap.
 * Props:
 *  - label: texto para la etiqueta (p.ej. "Nombre", "Correo electrónico", "Clave")
 *  - name: id y name del input
 *  - type: tipo de input (text, email, password, etc.)
 *  - value: valor controlado del input
 *  - onChange: manejador de cambio (e) => ...
 *  - placeholder: texto placeholder opcional
 *  - className: clases adicionales para el wrapper (p.ej. 'mb-4')
 */
export const LabeledInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  className = '',
}) => (
  <div className={"mb-4 " + className}>
    <label htmlFor={name} className="form-label text-uppercase small">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      className="form-control border border-dark rounded-0"
    />
  </div>
);