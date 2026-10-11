import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, Chart, registerables } from 'chart.js';
import { VentaService } from '../../core/services/venta.service';
import { ProductoService } from '../../core/services/producto.service';
import { CompraService } from '../../core/services/compra.service';
import { Venta, Producto, Compra } from '../../shared/models/models';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BaseChartDirective],
  providers: [VentaService, ProductoService, CompraService],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  // KPI Metrics
  totalVentas: number = 0;
  totalProductos: number = 0;
  ventasHoy: number = 0;
  cantidadVentasHoy: number = 0;

  // Compras Metrics
  totalComprasCount: number = 0;
  montoTotalCompras: number = 0;
  comprasPendientesCount: number = 0;
  comprasRecibidasCount: number = 0;

  // Data Collections
  allSales: Venta[] = [];
  salesTodayList: Venta[] = [];
  recentSales: Venta[] = [];
  allProductos: Producto[] = [];
  lowStockProducts: Producto[] = [];
  allCompras: Compra[] = [];

  // Modal State Control
  activeModal: 'totalProductos' | 'ventasHoy' | 'compras' | 'alertasStock' | null = null;
  modalSearchTerm: string = '';
  expandedVentaId: number | null = null;
  expandedCompraId: number | null = null;

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
    private productoService: ProductoService,
    private compraService: CompraService
  ) { }

  ngOnInit() {
    this.userRole = localStorage.getItem('rol');
    this.loadDashboardData();
  }

  @HostListener('window:keydown.escape')
  onEscapeKey() {
    if (this.activeModal) {
      this.closeModal();
    }
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
        this.lowStockProducts = productos.filter(p => p.stock <= (p.stockMinimo != null ? p.stockMinimo : 10));
      },
      error: (err) => console.error('Error loading products', err)
    });

    this.compraService.getAll().subscribe({
      next: (compras: Compra[]) => {
        this.allCompras = compras || [];
        this.totalComprasCount = this.allCompras.length;
        this.montoTotalCompras = this.allCompras.reduce((sum, c) => sum + (c.montoTotal || 0), 0);
        this.comprasPendientesCount = this.allCompras.filter(c => c.estado === 'PENDIENTE').length;
        this.comprasRecibidasCount = this.allCompras.filter(c => c.estado === 'RECIBIDO').length;
      },
      error: (err) => console.error('Error loading compras', err)
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
          label: 'Ventas Diarias (S/.)',
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
  openModal(type: 'totalProductos' | 'ventasHoy' | 'compras' | 'alertasStock') {
    this.activeModal = type;
    this.modalSearchTerm = '';
    this.expandedVentaId = null;
    this.expandedCompraId = null;
  }

  closeModal() {
    this.activeModal = null;
    this.modalSearchTerm = '';
    this.expandedVentaId = null;
    this.expandedCompraId = null;
  }

  toggleVentaDetails(id: number | undefined) {
    if (!id) return;
    this.expandedVentaId = this.expandedVentaId === id ? null : id;
  }

  toggleCompraDetails(id: number | undefined) {
    if (!id) return;
    this.expandedCompraId = this.expandedCompraId === id ? null : id;
  }

  // Calculations for Modals
  get totalStockValue(): number {
    return this.allProductos.reduce((sum, p) => sum + ((p.precioVenta || 0) * (p.stock || 0)), 0);
  }

  get averageTicketSize(): number {
    return this.allSales.length > 0 ? (this.totalVentas / this.allSales.length) : 0;
  }

  get averageTicketSizeToday(): number {
    return this.cantidadVentasHoy > 0 ? (this.ventasHoy / this.cantidadVentasHoy) : 0;
  }

  // Filtered lists for live modal search
  get filteredProductosModal(): Producto[] {
    if (!this.modalSearchTerm.trim()) return this.allProductos;
    const term = this.modalSearchTerm.toLowerCase();
    return this.allProductos.filter(p =>
      p.nombre.toLowerCase().includes(term) ||
      (p.codigoBarras && p.codigoBarras.toLowerCase().includes(term)) ||
      (p.categoria?.nombre && p.categoria.nombre.toLowerCase().includes(term))
    );
  }

  get filteredVentasHoyModal(): Venta[] {
    if (!this.modalSearchTerm.trim()) return this.salesTodayList;
    const term = this.modalSearchTerm.toLowerCase();
    return this.salesTodayList.filter(v =>
      (v.id && v.id.toString().includes(term)) ||
      (v.codigoVenta && v.codigoVenta.toLowerCase().includes(term)) ||
      (v.usuario?.username && v.usuario.username.toLowerCase().includes(term)) ||
      (v.tipoComprobante && v.tipoComprobante.toLowerCase().includes(term)) ||
      (v.metodoPago && v.metodoPago.toLowerCase().includes(term))
    );
  }

  get filteredComprasModal(): Compra[] {
    if (!this.modalSearchTerm.trim()) return this.allCompras;
    const term = this.modalSearchTerm.toLowerCase();
    return this.allCompras.filter(c =>
      (c.id && c.id.toString().includes(term)) ||
      (c.codigo && c.codigo.toLowerCase().includes(term)) ||
      (c.proveedorNombre && c.proveedorNombre.toLowerCase().includes(term)) ||
      (c.proveedor?.nombre && c.proveedor.nombre.toLowerCase().includes(term)) ||
      (c.estado && c.estado.toLowerCase().includes(term)) ||
      (c.estadoPago && c.estadoPago.toLowerCase().includes(term))
    );
  }

  get filteredLowStockModal(): Producto[] {
    if (!this.modalSearchTerm.trim()) return this.lowStockProducts;
    const term = this.modalSearchTerm.toLowerCase();
    return this.lowStockProducts.filter(p =>
      p.nombre.toLowerCase().includes(term) ||
      (p.codigoBarras && p.codigoBarras.toLowerCase().includes(term)) ||
      (p.categoria?.nombre && p.categoria.nombre.toLowerCase().includes(term))
    );
  }
}


