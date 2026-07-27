import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { VentaService } from '../../core/services/venta.service';
import { LoadingService } from '../../core/services/loading.service';
import { ExcelService } from '../../core/services/excel.service';
import { Venta } from '../../shared/models/models';

@Component({
    selector: 'app-reportes',
    standalone: true,
    imports: [CommonModule, BaseChartDirective, FormsModule],
    providers: [VentaService],
    templateUrl: './reportes.html',
    styleUrls: ['./reportes.css']
})
export class ReportesComponent implements OnInit, OnDestroy {
    totalVentas = 0;
    cantidadVentas = 0;
    private refreshInterval: any;

    // Advanced Stats
    topProduct: { name: string, quantity: number, total: number } | null = null;
    regularProduct: { name: string, quantity: number, total: number } | null = null;
    lowProduct: { name: string, quantity: number, total: number } | null = null;

    // Search and Table
    searchTerm = '';
    allVentas: Venta[] = [];
    filteredVentas: Venta[] = [];
    salesByProduct: any[] = [];

    // Export Filters
    filterType: 'TODAY' | 'MONTH' | 'SPECIFIC' | 'ALL' = 'TODAY';
    specificDate: string = new Date().toISOString().substring(0, 10);

    public barChartData: ChartData<'bar' | 'line'> = {
        labels: [],
        datasets: [
            {
                type: 'bar',
                data: [],
                label: 'Ventas ($)',
                backgroundColor: 'rgba(13, 110, 253, 0.7)',
                hoverBackgroundColor: 'rgba(13, 110, 253, 0.9)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 1,
                borderRadius: 4,
                yAxisID: 'y',
                order: 2,
                barPercentage: 0.6,
                categoryPercentage: 0.8
            },
            {
                type: 'line',
                data: [],
                label: 'Tendencia',
                borderColor: '#198754',
                backgroundColor: 'rgba(25, 135, 84, 0.1)',
                pointBackgroundColor: '#fff',
                pointBorderColor: '#198754',
                pointHoverBackgroundColor: '#198754',
                pointHoverBorderColor: '#fff',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4,
                yAxisID: 'y1',
                order: 1
            }
        ]
    };
    public barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    font: { size: 12, family: "'Segoe UI', Roboto, sans-serif" }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 13 },
                bodyFont: { size: 13 },
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                grid: {
                    color: '#f0f0f0',
                    tickLength: 0
                },
                ticks: {
                    font: { size: 11 },
                    color: '#6c757d',
                    callback: function (value) { return '$' + value; }
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { display: false },
                ticks: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: {
                    font: { size: 11 },
                    color: '#6c757d'
                }
            }
        }
    };
    public barChartType: ChartType = 'bar';

    constructor(
        private ventaService: VentaService,
        private loadingService: LoadingService,
        private excelService: ExcelService
    ) { }

    ngOnInit() {
        this.cargarDatos();
        this.refreshInterval = setInterval(() => {
            this.cargarDatos(true);
        }, 30000);
    }

    ngOnDestroy() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
    }

    cargarDatos(silent = false) {
        if (!silent) this.loadingService.show();
        this.ventaService.getHistorial().subscribe({
            next: (ventas: Venta[]) => {
                this.allVentas = ventas;
                this.procesarDatos(ventas);
                this.filterList();
                if (!silent) this.loadingService.hide();
            },
            error: () => {
                if (!silent) {
                    this.loadingService.hide();
                    console.error('Error loading reports');
                }
            }
        });
    }

    procesarDatos(ventas: Venta[]) {
        this.cantidadVentas = ventas.length;
        this.totalVentas = ventas.reduce((acc, v) => acc + v.total, 0);


        const mapDate = new Map<string, number>();
        ventas.forEach(v => {
            const date = v.fechaVenta ? v.fechaVenta.toString().substring(0, 10) : 'N/A';
            mapDate.set(date, (mapDate.get(date) || 0) + v.total);
        });
        const labels = Array.from(mapDate.keys()).sort();
        const data = labels.map(l => mapDate.get(l) || 0);

        let cumulative = 0;
        const cumData = data.map(v => cumulative += v);

        this.barChartData.labels = labels;
        this.barChartData.datasets[0].data = data;
        this.barChartData.datasets[1].data = cumData;


        const productsMap = new Map<string, number>();
        ventas.forEach(v => {
            v.detalles?.forEach(d => {
                const name = d.producto?.nombre || 'Unknown';
                productsMap.set(name, (productsMap.get(name) || 0) + d.cantidad);
            });
        });
        const ranked = Array.from(productsMap.entries()).sort((a, b) => b[1] - a[1]);
        if (ranked.length > 0) {
            this.topProduct = { name: ranked[0][0], quantity: ranked[0][1], total: 0 };
            this.lowProduct = { name: ranked[ranked.length - 1][0], quantity: ranked[ranked.length - 1][1], total: 0 };
            this.regularProduct = { name: ranked[Math.floor(ranked.length / 2)][0], quantity: ranked[Math.floor(ranked.length / 2)][1], total: 0 };
        }
    }

    filterList() {
        if (!this.searchTerm) {
            this.filteredVentas = this.allVentas;
        } else {
            const term = this.searchTerm.toLowerCase();
            this.filteredVentas = this.allVentas.filter(v =>
                v.usuario.username.toLowerCase().includes(term) ||
                (v.fechaVenta && v.fechaVenta.includes(term)) ||
                v.tipoComprobante.toLowerCase().includes(term)
            );
        }
    }

    exportToExcel() {
        let dataToExport = [...this.allVentas];
        const todayStr = new Date().toISOString().substring(0, 10);

        let filterLabel = 'Todo el Historial';
        if (this.filterType === 'TODAY') {
            dataToExport = this.allVentas.filter(v => v.fechaVenta && v.fechaVenta.startsWith(todayStr));
            filterLabel = `Ventas de Hoy (${todayStr})`;
        } else if (this.filterType === 'SPECIFIC' && this.specificDate) {
            dataToExport = this.allVentas.filter(v => v.fechaVenta && v.fechaVenta.startsWith(this.specificDate));
            filterLabel = `Fecha (${this.specificDate})`;
        }

        if (dataToExport.length === 0) {
            alert('No hay datos de ventas registrados para exportar en el rango seleccionado.');
            return;
        }

        this.excelService.exportReporteVentas(dataToExport, filterLabel);
    }
}
