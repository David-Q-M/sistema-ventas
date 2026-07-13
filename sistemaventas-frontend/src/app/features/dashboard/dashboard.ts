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
  // KPI Data
  totalVentas: number = 0;
  totalProductos: number = 0;
  ventasHoy: number = 0;
  cantidadVentasHoy: number = 0;


  recentSales: Venta[] = [];
  lowStockProducts: Producto[] = [];


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
          this.processSales(ventas);
        },
        error: (err) => {
          if (err.status !== 403) console.error('Error loading sales', err);
        }
      });
    }


    this.productoService.getAll().subscribe({
      next: (productos) => {
        this.totalProductos = productos.length;

        this.lowStockProducts = productos.filter(p => p.stock < 10).slice(0, 5);
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


    const salesToday = ventas.filter(v => {
      if (!v.fechaVenta) return false;

      const fechaVentaStr = v.fechaVenta.toString().substring(0, 10);
      return fechaVentaStr === today;
    });

    this.cantidadVentasHoy = salesToday.length;
    this.ventasHoy = salesToday.reduce((acc, v) => acc + (v.total || 0), 0);

    // 4. Ventas Recientes (CRUD - Read)
    // Ordenamos por fecha descendente y tomamos las últimas 5 para la tabla del dashboard
    this.recentSales = [...ventas]
      .sort((a, b) => new Date(b.fechaVenta).getTime() - new Date(a.fechaVenta).getTime())
      .slice(0, 5);

    // 5. Preparación de Datos para el Gráfico (Últimos 7 días)
    const last7DaysMap = new Map<string, number>();

    // Inicializamos el mapa con los últimos 7 días en 0 para que no queden huecos en el gráfico
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      last7DaysMap.set(dateStr, 0);
    }

    // Llenamos el mapa con los totales de las ventas que coincidan con esos días
    ventas.forEach(v => {
      if (v.fechaVenta) {
        const date = v.fechaVenta.toString().substring(0, 10);
        if (last7DaysMap.has(date)) {
          last7DaysMap.set(date, (last7DaysMap.get(date) || 0) + (v.total || 0));
        }
      }
    });

    // 6. Actualización del objeto de datos del gráfico (Chart.js)
    this.lineChartData = {
      labels: Array.from(last7DaysMap.keys()),
      datasets: [
        {
          data: Array.from(last7DaysMap.values()),
          label: 'Ventas Diarias ($)',
          backgroundColor: 'rgba(79, 70, 229, 0.2)', // Color Indigo suave
          borderColor: '#4f46e5', // Color Indigo sólido
          pointBackgroundColor: '#4f46e5',
          pointBorderColor: '#fff',
          fill: true,
          tension: 0.4 // Curvatura de la línea para un aspecto moderno
        }
      ]
    };
  }
}
