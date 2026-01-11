import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, Chart, registerables } from 'chart.js';
import { VentaService } from '../../core/services/venta.service';
import { ProductoService } from '../../core/services/producto.service';
import { Venta, Producto } from '../../shared/models/models';

// Register Chart.js components
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
  // KPI Data
  totalVentas: number = 0;
  totalProductos: number = 0;
  ventasHoy: number = 0;
  cantidadVentasHoy: number = 0;

  // Tables
  recentSales: Venta[] = [];
  lowStockProducts: Producto[] = [];

  // Chart Configuration
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Ventas (7 Días)',
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: '#4f46e5',
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4f46e5',
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
      x: { grid: { display: false }, ticks: { display: false } } // Minimalist chart
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
    // 1. Load Sales (Only if not ALMACENERO)
    if (this.userRole !== 'ALMACENERO') {
      this.ventaService.getHistorial().subscribe({
        next: (ventas) => {
          this.processSales(ventas);
        },
        error: (err) => {
          if (err.status !== 403) console.error('Error loading sales', err);
        }
      });
    }

    // 2. Load Products
    this.productoService.getAll().subscribe({
      next: (productos) => {
        this.totalProductos = productos.length;
        // Mock low stock logic (e.g. < 5)
        this.lowStockProducts = productos.filter(p => p.stock < 10).slice(0, 5);
      },
      error: (err) => console.error('Error loading products', err)
    });
  }

  processSales(ventas: Venta[]) {
    const today = new Date().toISOString().substring(0, 10);

    // Total Revenue
    this.totalVentas = ventas.reduce((acc, v) => acc + v.total, 0);

    // Sales Today
    const salesToday = ventas.filter(v => v.fechaVenta && v.fechaVenta.startsWith(today));
    this.cantidadVentasHoy = salesToday.length;
    this.ventasHoy = salesToday.reduce((acc, v) => acc + v.total, 0);

    // Recent Sales (Top 5)
    this.recentSales = [...ventas]
      .sort((a, b) => new Date(b.fechaVenta).getTime() - new Date(a.fechaVenta).getTime())
      .slice(0, 5);

    // Chart Data (Last 7 Days)
    const last7DaysMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7DaysMap.set(d.toISOString().substring(0, 10), 0);
    }

    ventas.forEach(v => {
      const date = v.fechaVenta ? v.fechaVenta.substring(0, 10) : '';
      if (last7DaysMap.has(date)) {
        last7DaysMap.set(date, (last7DaysMap.get(date) || 0) + v.total);
      }
    });

    this.lineChartData = {
      labels: Array.from(last7DaysMap.keys()),
      datasets: [{
        data: Array.from(last7DaysMap.values()),
        label: 'Ventas',
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: '#4f46e5',
        pointBackgroundColor: '#4f46e5',
        fill: true,
        tension: 0.4
      }]
    };
  }
}
