import { useState } from 'react';

// 1. 🛠️ Define aquí la interface para las Props

export const ProductoCard = ({ nombre, precio, onAdd }) => {
  // 2. 🛠️ Añade el tipo al useState para que empiece en 0
  const [cantidad, setCantidad] = useState();

  const handleIncrement = () => {
    setCantidad(cantidad + 1);
  };

  return (
    <div>
      <h3>{nombre}</h3>
      <p>Precio: ${precio}</p>
      <button onClick={() => onAdd(cantidad)}>Agregar al carrito</button>
    </div>
  );
};