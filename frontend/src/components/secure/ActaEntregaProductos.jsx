
const ActaPDFAislada = ({ entregaSeleccionada }) => {
  // Formatear la fecha directamente sin useState ni useEffect
  let fechaFormateada = "";
  if (entregaSeleccionada?.fecha) {
    const fecha = new Date(entregaSeleccionada.fecha);
    try {
      fechaFormateada = fecha.toLocaleDateString("es-CO", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });
    } catch (e) {
      // Fallback en caso de error con toLocaleDateString
      fechaFormateada = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
    }
  }

  // Estilos en línea para evitar cualquier dependencia externa
  const styles = {
    container: {
      width: "100%",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#FFFFFF",
      color: "#000000",
      padding: "20px",
    },
    header: {
      textAlign: "center",
      marginBottom: "20px",
    },
    headerLogo: {
      maxHeight: "60px",
      maxWidth: "80%",
    },
    title: {
      textAlign: "center",
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "15px",
    },
    date: {
      textAlign: "right",
      fontSize: "14px",
      marginBottom: "10px",
    },
    paragraph: {
      fontSize: "14px",
      marginBottom: "15px",
      lineHeight: "1.5",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginBottom: "20px",
    },
    th: {
      border: "1px solid #000000",
      padding: "8px",
      backgroundColor: "#f0f0f0",
      fontSize: "14px",
    },
    td: {
      border: "1px solid #000000",
      padding: "6px",
      fontSize: "12px",
    },
    tdCenter: {
      border: "1px solid #000000",
      padding: "6px",
      textAlign: "center",
      fontSize: "12px",
    },
    manifestTitle: {
      fontSize: "13px",
      fontWeight: "bold",
      marginBottom: "10px",
    },
    list: {
      paddingLeft: "20px",
      fontSize: "12px",
      lineHeight: "1.5",
    },
    listItem: {
      marginBottom: "5px",
    },
    footer: {
      width: "100%",
      marginTop: "40px",
      textAlign: "center",
    },
    footerImage: {
      maxHeight: "50px",
      maxWidth: "80%",
    },
    signatureBlock: {
      marginTop: "25px",
    },
    signatureCell: {
      border: "1px solid #000000",
      padding: "6px",
      height: "60px",
      fontSize: "12px",
    }
  };

  return (
    <div style={styles.container}>
      {/* Encabezado */}
      <div style={styles.header}>
        {/* Nota: Las imágenes podrían no cargarse en el PDF si son rutas relativas */}
        {/* Para mejorar esto, considera usar URLs absolutas o incrustar imágenes como base64 */}
        <p>[Logo de la Empresa]</p>
      </div>

      <div>
        <h3 style={styles.date}>Fecha: {fechaFormateada}</h3>
        <h1 style={styles.title}>ACTA ENTREGA DE EQUIPOS</h1>
        <p style={styles.paragraph}>
          Con la presente acta se le hace entrega de los siguientes elementos
          para ser utilizados en sus actividades, de manera segura:{" "}
          {entregaSeleccionada?.proyecto || ""}
        </p>
      </div>

      {/* Tabla de elementos */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>#</th>
            <th style={styles.th}>Cantidad</th>
            <th style={styles.th}>Unidad</th>
            <th style={styles.th}>Descripción</th>
            <th style={styles.th}>Marca</th>
            <th style={styles.th}>Serial</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(entregaSeleccionada?.EntregaProductos) ? 
            entregaSeleccionada.EntregaProductos.map((detalle, index) => (
              <tr key={index}>
                <td style={styles.tdCenter}>{index + 1}</td>
                <td style={styles.tdCenter}>{detalle.cantidad}</td>
                <td style={styles.td}>{detalle.Producto?.unidadMedida || "N/A"}</td>
                <td style={styles.td}>{detalle.Producto?.descripcion || ""}</td>
                <td style={styles.td}>{detalle.Producto?.marca || ""}</td>
                <td style={styles.td}>{detalle.serial || "N/A"}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={styles.td}>No hay productos disponibles</td>
              </tr>
            )
          }
        </tbody>
      </table>

      {/* Manifiesto */}
      <div>
        <p style={styles.manifestTitle}>Manifiesto que:</p>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            He recibido los equipos relacionados y me comprometo a cuidarlos y
            darles el manejo adecuado para cada actividad.
          </li>
          <li style={styles.listItem}>
            Que he sido instruido sobre el uso, mantenimiento y cuidados de
            estos.
          </li>
          <li style={styles.listItem}>
            Los equipos y herramientas que aquí se entregan son y serán de la
            empresa Colombianet y Sepcom ingeniería y Telecomunicaciones
            S.A.S. En todo momento, en caso de retiro por cualquier causa debe
            devolverlos de forma inmediata, si ocurriera la pérdida, daño o no
            devolución de los mismos, autorizo a mi empleador para que retenga
            de mi salario o liquidación definitiva el valor de los mismos.
          </li>
        </ul>
      </div>

      {/* Firmas */}
      <div style={styles.signatureBlock}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Entregado por:</th>
              <th style={styles.th}>Cargo:</th>
              <th style={styles.th}>Recibido por:</th>
              <th style={styles.th}>Cargo:</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>{entregaSeleccionada?.almacenistaData?.nombre || ""}</td>
              <td style={styles.td}>Almacén</td>
              <td style={styles.td}>{entregaSeleccionada?.tecnicoData?.nombre || ""}</td>
              <td style={styles.td}>{entregaSeleccionada?.tecnicoData?.cargo || ""}</td>
            </tr>
            <tr>
              <th style={styles.th}>Firma:</th>
              <th style={styles.th}>Cédula:</th>
              <th style={styles.th}>Firma:</th>
              <th style={styles.th}>Cédula:</th>
            </tr>
            <tr>
              <td style={styles.signatureCell}></td>
              <td style={styles.td}>N/A</td>
              <td style={styles.signatureCell}></td>
              <td style={styles.td}>{entregaSeleccionada?.tecnicoData?.cedula || ""}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p>[Información de pie de página de la empresa]</p>
      </div>
    </div>
  );
};

export default ActaPDFAislada;