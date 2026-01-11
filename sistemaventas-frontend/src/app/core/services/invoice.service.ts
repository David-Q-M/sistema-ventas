import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VentaDTO, Usuario } from '../../shared/models/models';

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {

    generateInvoice(venta: VentaDTO, usuario: Usuario | null, total: number, idVenta: number | string = 'PENDIENTE') {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text('SISTEMA VENTAS', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text('Comprobante Eléctronico', 14, 30);

        // Info Venta
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`N° Venta: ${idVenta}`, 14, 45);
        doc.text(`Fecha: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 52);

        const clienteInfo = (venta as any).cliente;
        if (clienteInfo && clienteInfo.nombre) {
            doc.text(`Cliente: ${clienteInfo.nombre}`, 14, 59);
            doc.text(`Doc: ${clienteInfo.documento || '-'}`, 14, 64);
            if (clienteInfo.direccion) {
                doc.text(`Dirección: ${clienteInfo.direccion}`, 14, 69);
            }
        } else {
            doc.text(`Cliente: Cliente General`, 14, 59);
        }

        doc.text(`Vendedor: ${usuario?.nombreCompleto || 'Desconocido'}`, 14, clienteInfo?.direccion ? 76 : 69); // Adjust Y based on address
        doc.text(`Tipo: ${venta.tipoComprobante}`, 160, 45);

        // Table
        const data = venta.productos.map((item: any) => [
            item.productoNombre,
            item.cantidad,
            `$${item.precioUnitario.toFixed(2)}`,
            `$${(item.cantidad * item.precioUnitario).toFixed(2)}`
        ]);

        autoTable(doc, {
            head: [['Producto', 'Cant.', 'P. Unit', 'Importe']],
            body: data,
            startY: (venta as any).cliente?.direccion ? 85 : 78,
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66] }
        });

        // Total
        const finalY = (doc as any).lastAutoTable.finalY || 75;
        doc.setFontSize(12);
        doc.text(`TOTAL: $${total.toFixed(2)}`, 140, finalY + 15);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Gracias por su compra.', 14, finalY + 30);

        // Open PDF
        doc.save(`voucher_${idVenta}.pdf`);
    }
}
