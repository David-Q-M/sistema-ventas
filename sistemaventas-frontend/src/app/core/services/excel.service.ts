import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { Venta, Producto } from '../../shared/models/models';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
    providedIn: 'root'
})
export class ExcelService {

    constructor() { }

    /**
     * Exporta un reporte profesional de Ventas en formato Excel con encabezado corporativo,
     * cuadro de métricas clave (KPIs), tabla detallada y totales.
     */
    public exportReporteVentas(ventas: Venta[], filterLabel: string = 'General'): void {
        const totalIngresos = ventas.reduce((acc, v) => acc + (v.total || 0), 0);
        const totalTransacciones = ventas.length;
        const ticketPromedio = totalTransacciones > 0 ? (totalIngresos / totalTransacciones) : 0;
        const fechaHoraEmision = new Date().toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });

        // 1. Matriz de celdas AOA (Array of Arrays)
        const aoaData: any[][] = [];

        // Encabezado Corporativo
        aoaData.push(['SISTEMA DE VENTAS - REPORTE DE VENTAS']);
        aoaData.push([`Filtro Aplicado: ${filterLabel}   |   Fecha de Emisión: ${fechaHoraEmision}   |   Moneda: Soles (S/.)`]);
        aoaData.push([]); // Espacio

        // Cuadro de Resumen Ejecutivo (KPIs)
        aoaData.push(['RESUMEN EJECUTIVO', '']);
        aoaData.push(['Métrica', 'Valor']);
        aoaData.push(['Total de Ingresos acumulados', totalIngresos]);
        aoaData.push(['Total de Transacciones', totalTransacciones]);
        aoaData.push(['Ticket Promedio por Venta', parseFloat(ticketPromedio.toFixed(2))]);
        aoaData.push([]); // Espacio

        // Cabeceras de la Tabla de Datos
        aoaData.push([
            'ID VENTA',
            'FECHA Y HORA',
            'VENDEDOR',
            'COMPROBANTE',
            'DETALLE DE PRODUCTOS',
            'TOTAL (S/.)'
        ]);

        // Filas de Datos
        ventas.forEach(v => {
            const fechaFmt = v.fechaVenta ? new Date(v.fechaVenta).toLocaleString('es-PE') : '---';
            const productosStr = v.detalles && v.detalles.length > 0
                ? v.detalles.map(d => `${d.producto?.nombre || 'Producto'} (x${d.cantidad})`).join(', ')
                : 'Sin detalle registrado';

            aoaData.push([
                `VNT-${String(v.id).padStart(4, '0')}`,
                fechaFmt,
                v.usuario?.username || 'admin',
                v.tipoComprobante || 'BOLETA',
                productosStr,
                v.total || 0
            ]);
        });

        // Fila de Totales Generales
        aoaData.push([]);
        aoaData.push([
            'TOTAL GENERAL',
            '',
            '',
            '',
            `${totalTransacciones} Transacción(es) Exportadas`,
            totalIngresos
        ]);

        // Generar Hoja
        const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(aoaData);

        // Formato numérico de celdas en Excel
        this.applyCellFormatting(worksheet, aoaData, [
            { row: 5, col: 1 }, // Total Ingresos KPI
            { row: 7, col: 1 }  // Ticket Promedio KPI
        ], 10, 5);              // Columna Total (F: índice 5) a partir de la fila 10

        // Configurar Ancho de Columnas
        worksheet['!cols'] = [
            { width: 14 }, // ID Venta
            { width: 22 }, // Fecha
            { width: 18 }, // Vendedor
            { width: 16 }, // Comprobante
            { width: 50 }, // Productos
            { width: 20 }  // Total S/.
        ];

        // Crear y guardar el Libro Excel
        const workbook: XLSX.WorkBook = {
            Sheets: { 'Reporte de Ventas': worksheet },
            SheetNames: ['Reporte de Ventas']
        };

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const cleanLabel = filterLabel.replace(/[^a-zA-Z0-9]/g, '_');
        const dateStr = new Date().toISOString().substring(0, 10);
        this.saveAsExcelFile(excelBuffer, `Reporte_Ventas_${cleanLabel}_${dateStr}`);
    }

    /**
     * Exporta un reporte profesional de Inventario de Productos.
     */
    public exportReporteProductos(productos: Producto[]): void {
        const totalProductos = productos.length;
        const totalStock = productos.reduce((acc, p) => acc + (p.stock || 0), 0);
        const valorInventario = productos.reduce((acc, p) => acc + ((p.stock || 0) * (p.precioVenta || 0)), 0);
        const fechaHoraEmision = new Date().toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });

        const aoaData: any[][] = [];
        aoaData.push(['SISTEMA DE VENTAS - INVENTARIO GENERAL DE PRODUCTOS']);
        aoaData.push([`Fecha de Emisión: ${fechaHoraEmision}   |   Moneda: Soles (S/.)`]);
        aoaData.push([]);

        aoaData.push(['RESUMEN DE INVENTARIO', '']);
        aoaData.push(['Métrica', 'Valor']);
        aoaData.push(['Total Productos Únicos', totalProductos]);
        aoaData.push(['Stock Total Unidades', totalStock]);
        aoaData.push(['Valor Estimado de Inventario', valorInventario]);
        aoaData.push([]);

        aoaData.push([
            'ID',
            'CÓDIGO BARRAS',
            'PRODUCTO',
            'CATEGORÍA',
            'STOCK ACTUAL',
            'PRECIO VENTA (S/.)',
            'VALOR ESTIMADO (S/.)'
        ]);

        productos.forEach(p => {
            const stock = p.stock || 0;
            const precio = p.precioVenta || 0;
            aoaData.push([
                `PRD-${String(p.id).padStart(4, '0')}`,
                p.codigoBarras || 'S/N',
                p.nombre,
                p.categoria?.nombre || 'General',
                stock,
                precio,
                stock * precio
            ]);
        });

        aoaData.push([]);
        aoaData.push(['TOTALES', '', '', '', totalStock, '', valorInventario]);

        const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(aoaData);

        worksheet['!cols'] = [
            { width: 14 },
            { width: 20 },
            { width: 35 },
            { width: 20 },
            { width: 16 },
            { width: 20 },
            { width: 22 }
        ];

        const workbook: XLSX.WorkBook = {
            Sheets: { 'Inventario': worksheet },
            SheetNames: ['Inventario']
        };

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dateStr = new Date().toISOString().substring(0, 10);
        this.saveAsExcelFile(excelBuffer, `Inventario_Productos_${dateStr}`);
    }

    private applyCellFormatting(ws: XLSX.WorkSheet, data: any[][], customKpis: { row: number, col: number }[], startDataRow: number, currencyCol: number) {
        for (let r = 0; r < data.length; r++) {
            const row = data[r];
            for (let c = 0; c < row.length; c++) {
                const cellRef = XLSX.utils.encode_cell({ r, c });
                if (!ws[cellRef]) continue;

                // Aplicar formato de moneda a los KPIs numéricos
                customKpis.forEach(kpi => {
                    if (kpi.row === r && kpi.col === c && typeof row[c] === 'number') {
                        ws[cellRef].t = 'n';
                        ws[cellRef].z = '"S/." #,##0.00';
                    }
                });

                // Aplicar formato de moneda a la columna especificada en la tabla y total general
                if (r >= startDataRow && c === currencyCol && typeof row[c] === 'number') {
                    ws[cellRef].t = 'n';
                    ws[cellRef].z = '"S/." #,##0.00';
                }
            }
        }
    }

    public exportAsExcelFile(json: any[], excelFileName: string): void {
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        this.autoFitColumns(json, worksheet);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    private autoFitColumns(json: any[], worksheet: XLSX.WorkSheet) {
        const objectMaxLength: number[] = [];
        if (json.length === 0) return;
        const colNames = Object.keys(json[0]);

        colNames.forEach((col, i) => {
            objectMaxLength[i] = col.length;
        });

        json.forEach(row => {
            colNames.forEach((col, i) => {
                const cellValue = row[col] ? String(row[col]) : '';
                if (cellValue.length > objectMaxLength[i]) {
                    objectMaxLength[i] = cellValue.length;
                }
            });
        });

        worksheet['!cols'] = objectMaxLength.map(w => ({ width: Math.min(w + 2, 50) }));
    }

    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
        FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
    }
}

