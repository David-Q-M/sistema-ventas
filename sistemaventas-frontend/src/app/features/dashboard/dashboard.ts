import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, Chart, registerables } from 'chart.js';
import { VentaService } from '../../core/services/venta.service';
import { ProductoService } from '../../core/services/producto.service';
import { Venta, Producto } from '../../shared/models/models';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  providers: [VentaService, ProductoService],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  // KPI Metrics
  totalVentas: number = 0;
  totalProductos: number = 0;
  ventasHoy: number = 0;
  cantidadVentasHoy: number = 0;

  // Data Collections
  allSales: Venta[] = [];
  salesTodayList: Venta[] = [];
  recentSales: Venta[] = [];
  allProductos: Producto[] = [];
  lowStockProducts: Producto[] = [];

  // Modal State Control
  activeModal: 'ventasHoy' | 'totalProductos' | 'ingresosTotales' | 'alertasStock' | null = null;
  modalSearchTerm: string = '';

  // Chart Setup
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Ventas (7 Días)',
        backgroundColor: 'rgba(25, 118, 210, 0.15)',
        borderColor: '#1976D2',
        pointBackgroundColor: '#0D47A1',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#1976D2',
        fill: true,
        tension: 0.4
      }
    ]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: { line: { tension: 0.4 } },
    scales: {
      y: { display: false },
      x: { grid: { display: false }, ticks: { display: false } }
    },
    plugins: { legend: { display: false } }
  };

  public lineChartType: ChartType = 'line';
  userRole: string | null = '';

  constructor(
    private ventaService: VentaService,
    private productoService: ProductoService
  ) { }

  ngOnInit() {
    this.userRole = localStorage.getItem('rol');
    this.loadDashboardData();
  }

  loadDashboardData() {
    if (this.userRole !== 'ALMACENERO') {
      this.ventaService.getHistorial().subscribe({
        next: (ventas) => {
          this.allSales = ventas;
          this.processSales(ventas);
        },
        error: (err) => {
          if (err.status !== 403) console.error('Error loading sales', err);
        }
      });
    }

    this.productoService.getAll().subscribe({
      next: (productos) => {
        this.allProductos = productos;
        this.totalProductos = productos.length;
        this.lowStockProducts = productos.filter(p => p.stock < 10);
      },
      error: (err) => console.error('Error loading products', err)
    });
  }

  processSales(ventas: Venta[]) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    this.totalVentas = ventas.reduce((acc, v) => acc + (v.total || 0), 0);

    this.salesTodayList = ventas.filter(v => {
      if (!v.fechaVenta) return false;
      const fechaVentaStr = v.fechaVenta.toString().substring(0, 10);
      return fechaVentaStr === today;
    });

    this.cantidadVentasHoy = this.salesTodayList.length;
    this.ventasHoy = this.salesTodayList.reduce((acc, v) => acc + (v.total || 0), 0);

    this.recentSales = [...ventas]
      .sort((a, b) => new Date(b.fechaVenta).getTime() - new Date(a.fechaVenta).getTime())
      .slice(0, 5);

    // Chart logic
    const last7DaysMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      last7DaysMap.set(dateStr, 0);
    }

    ventas.forEach(v => {
      if (v.fechaVenta) {
        const date = v.fechaVenta.toString().substring(0, 10);
        if (last7DaysMap.has(date)) {
          last7DaysMap.set(date, (last7DaysMap.get(date) || 0) + (v.total || 0));
        }
      }
    });

    this.lineChartData = {
      labels: Array.from(last7DaysMap.keys()),
      datasets: [
        {
          data: Array.from(last7DaysMap.values()),
          label: 'Ventas Diarias ($)',
          backgroundColor: 'rgba(25, 118, 210, 0.15)',
          borderColor: '#1976D2',
          pointBackgroundColor: '#0D47A1',
          pointBorderColor: '#fff',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }

  // Interactive Modal Handlers
  openModal(type: 'ventasHoy' | 'totalProductos' | 'ingresosTotales' | 'alertasStock') {
    this.activeModal = type;
    this.modalSearchTerm = '';
  }

  closeModal() {
    this.activeModal = null;
  }

  // Calculations for Modals
  get totalStockValue(): number {
    return this.allProductos.reduce((sum, p) => sum + ((p.precioVenta || 0) * (p.stock || 0)), 0);
  }

  get averageTicketSize(): number {
    return this.allSales.length > 0 ? (this.totalVentas / this.allSales.length) : 0;
  }
}
