function establecerFecha() {
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses comienzan en 0
    const anio = fecha.getFullYear();
    document.getElementById('fecha').textContent = `${dia}/${mes}/${anio}`;
}
window.onload = establecerFecha;

function agregarProducto() {
    const tableBody = document.getElementById('productTable');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" class="producto" placeholder="Nombre del Producto" required></td>
        <td><input type="number" min="1" class="cantidad" placeholder="Cantidad" required></td>
        <td><input type="number" min="1" class="precio-unitario" placeholder="Precio Unitario" required></td>
        <td><input type="number" class="precio" placeholder="Precio Total" readonly></td>
    `;
    tableBody.appendChild(newRow);
    aplicarColorFilas();
}

function aplicarColorFilas() {
    const rows = document.querySelectorAll('#productTable tr');
    rows.forEach((row, index) => {
        row.style.backgroundColor = index % 2 === 0 ? '#f2f2f2' : '#ffffff'; // Alternar colores
    });
}

function calcularTotal() {
    const ivaRate = 0.21;
    const interestRateAhora18 = 0.75;
    let subtotal = 0;
    const rows = document.querySelectorAll('#productTable tr');
    rows.forEach(row => {
        const cantidad = row.querySelector('.cantidad').value;
        const precioUnitario = row.querySelector('.precio-unitario').value;
        if (cantidad === "" || precioUnitario === "") {
            row.remove(); // Eliminar la fila si hay campos vacíos
            return;
        }
        const cantidadNum = parseFloat(cantidad) || 0;
        const precioUnitarioNum = parseFloat(precioUnitario) || 0;
        const precioTotal = cantidadNum * precioUnitarioNum;
        row.querySelector('.precio').value = precioTotal.toFixed(2);
        subtotal += precioTotal;
    });
    const iva = subtotal * ivaRate;
    const total = subtotal + iva;
    const cuota12 = total / 12;
    const cuota18 = total * (1 + interestRateAhora18) / 18;
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('iva').textContent = iva.toFixed(2);
    document.getElementById('total').textContent = total.toFixed(2);
    document.getElementById('cuota12').textContent = cuota12.toFixed(2);
    document.getElementById('cuota18').textContent = cuota18.toFixed(2);
}

function imprimirPresupuesto() {
    window.print();
}

function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const cliente = document.getElementById('cliente').value;
    const subtotal = document.getElementById('subtotal').textContent;
    const iva = document.getElementById('iva').textContent;
    const total = document.getElementById('total').textContent;
    const fecha = document.getElementById('fecha').textContent;

    // Título
    doc.setFontSize(18);
    doc.text("Presupuesto", 20, 20);

    // Cliente y fecha
    doc.setFontSize(12);
    doc.text(`Cliente: ${cliente}`, 20, 30);
    doc.text(`Fecha: ${fecha}`, 160, 30); // Fecha a la derecha

    // Encabezado de tabla
    const startY = 60;
    const rowHeight = 10;
    doc.setFontSize(10);
    doc.setFillColor(200, 200, 200);
    doc.rect(20, startY, 170, rowHeight, 'F'); // Fondo de encabezado
    doc.text("Producto", 22, startY + 7);
    doc.text("Cantidad", 82, startY + 7);
    doc.text("Precio Unitario", 130, startY + 7);
    doc.text("Precio", 160, startY + 7);

    // Filas de productos
    let lineHeight = startY + rowHeight + 5;
    document.querySelectorAll('#productTable tr').forEach((row, index) => {
        const producto = row.querySelector('.producto').value;
        const cantidad = row.querySelector('.cantidad').value;
        const precioUnitario = row.querySelector('.precio-unitario').value;
        const precioTotal = row.querySelector('.precio').value;
        if (cantidad && producto && precioUnitario) {
            const fillColor = index % 2 === 0 ? [240, 240, 240] : [255, 255, 255];
            doc.setFillColor(...fillColor);
            doc.rect(20, lineHeight, 170, rowHeight, 'F'); // Fondo de fila
            doc.setFontSize(10);
            doc.text(`${producto}`, 22, lineHeight + 7); // Producto primero
            doc.text(`${cantidad}`, 82, lineHeight + 7); // Cantidad segundo
            doc.text(`$${precioUnitario}`, 130, lineHeight + 7);
            doc.text(`$${precioTotal}`, 160, lineHeight + 7);
            lineHeight += rowHeight;
        }
    });

    // Totales a la derecha
    lineHeight += 5; // Espacio adicional
    doc.text(`Subtotal: $${subtotal}`, 22, lineHeight);
    lineHeight += rowHeight;
    doc.text(`IVA: $${iva}`, 22, lineHeight);
    lineHeight += rowHeight;
    doc.text(`Total: $${total}`, 22, lineHeight);

    // Agradecimiento
    doc.text(`¡Gracias por su preferencia!`, 85 , 275);

    // Línea en la parte inferior
    doc.setDrawColor(0); // Color de la línea
    doc.line(20, 270, 190, 270); // Dibuja la línea
    doc.save('presupuesto.pdf');
}
