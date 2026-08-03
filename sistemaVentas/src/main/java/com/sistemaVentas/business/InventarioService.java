package com.sistemaVentas.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sistemaVentas.dataaccess.MovimientoInventarioRepository;
import com.sistemaVentas.dataaccess.ProductoRepository;
import com.sistemaVentas.dto.AjusteStockDTO;
import com.sistemaVentas.dto.AlertaVencimientoDTO;
import com.sistemaVentas.entity.MovimientoInventario;
import com.sistemaVentas.entity.Producto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventarioService {

    @Autowired
    private MovimientoInventarioRepository movimientoRepo;

    @Autowired
    private ProductoRepository productoRepo;

    /**
     * RF29: Registrar Audit Log de movimiento de inventario de forma síncrona y transaccional.
     */
    @Transactional
    public MovimientoInventario registrarMovimiento(Producto producto, String tipoMovimiento, int cantidad, int stockAnterior, int stockFinal, String usuario, String motivo) {
        MovimientoInventario mov = new MovimientoInventario();
        mov.setProducto(producto);
        mov.setTipoMovimiento(tipoMovimiento);
        mov.setCantidad(cantidad);
        mov.setStockAnterior(stockAnterior);
        mov.setStockFinal(stockFinal);
        mov.setUsuario((usuario != null && !usuario.trim().isEmpty()) ? usuario : "SISTEMA");
        mov.setMotivo(motivo);
        mov.setFecha(LocalDateTime.now());
        return movimientoRepo.save(mov);
    }

    /**
     * RF29: Ajuste Manual de Inventario auditado.
     */
    @Transactional
    public void ajustarStockManual(AjusteStockDTO dto, String usuarioActual) {
        Producto producto = productoRepo.findById(dto.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + dto.getProductoId()));

        int stockAnterior = (producto.getStock() != null) ? producto.getStock() : 0;
        int nuevoStock = dto.getNuevoStock();
        int diferencia = nuevoStock - stockAnterior;

        if (diferencia == 0) {
            throw new RuntimeException("El nuevo stock es idéntico al stock actual. No hay cambios que ajustar.");
        }

        String tipoMovimiento = (diferencia > 0) ? "ENTRADA" : "SALIDA";
        int cantidadMovida = Math.abs(diferencia);

        // Actualizar stock del producto
        producto.setStock(nuevoStock);
        productoRepo.save(producto);

        // Registrar movimiento de auditoría de forma inmutable
        String usuarioAudit = (dto.getUsuario() != null && !dto.getUsuario().trim().isEmpty()) 
                ? dto.getUsuario() 
                : usuarioActual;
        String motivoAudit = "AJUSTE MANUAL: " + dto.getMotivo();

        registrarMovimiento(producto, tipoMovimiento, cantidadMovida, stockAnterior, nuevoStock, usuarioAudit, motivoAudit);
    }

    /**
     * RF28: Control de Vencimientos con Alertas Semáforo.
     * Niveles: Crítico (< 7 días o vencido), Precaución (7-30 días), Normal (> 30 días).
     */
    public List<AlertaVencimientoDTO> obtenerAlertasVencimiento() {
        List<Producto> productos = productoRepo.findAll();
        LocalDate hoy = LocalDate.now();

        return productos.stream()
                .filter(p -> p.getFechaVencimiento() != null)
                .map(p -> {
                    LocalDate fVenc = p.getFechaVencimiento();
                    long diasRestantes = ChronoUnit.DAYS.between(hoy, fVenc);

                    String estadoAlerta;
                    if (diasRestantes < 7) {
                        estadoAlerta = "CRITICO";
                    } else if (diasRestantes <= 30) {
                        estadoAlerta = "PRECAUCION";
                    } else {
                        estadoAlerta = "NORMAL";
                    }

                    String catNombre = (p.getCategoria() != null) ? p.getCategoria().getNombre() : "Sin Categoría";
                    boolean esPerecible = Boolean.TRUE.equals(p.getPerecible());

                    return new AlertaVencimientoDTO(
                            p.getId(),
                            p.getNombre(),
                            p.getCodigoBarras(),
                            catNombre,
                            p.getStock() != null ? p.getStock() : 0,
                            p.getStockMinimo() != null ? p.getStockMinimo() : 10,
                            fVenc,
                            diasRestantes,
                            estadoAlerta,
                            esPerecible
                    );
                })
                .sorted(Comparator.comparingLong(AlertaVencimientoDTO::getDiasRestantes))
                .collect(Collectors.toList());
    }

    /**
     * RF29: Consultar Historial de Movimientos con Paginación Obligatoria.
     */
    public Page<MovimientoInventario> obtenerMovimientosPaginados(Long productoId, String tipoMovimiento, LocalDateTime fechaInicio, LocalDateTime fechaFin, Pageable pageable) {
        if (tipoMovimiento != null && tipoMovimiento.trim().isEmpty()) {
            tipoMovimiento = null;
        }
        return movimientoRepo.buscarConFiltrosPaginados(productoId, tipoMovimiento, fechaInicio, fechaFin, pageable);
    }
}
