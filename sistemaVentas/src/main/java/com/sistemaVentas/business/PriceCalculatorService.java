package com.sistemaVentas.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sistemaVentas.dataaccess.ProductoRepository;
import com.sistemaVentas.dto.CalculoVentaDTO;
import com.sistemaVentas.dto.DetalleDTO;
import com.sistemaVentas.entity.Producto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class PriceCalculatorService {

    @Autowired
    private ProductoRepository productoRepo;

    /**
     * RF32: Motor de cálculo de precios y descuentos inalterable en backend.
     * Cero Confianza: Los precios se extraen directamente de PostgreSQL mediante productoRepo.
     */
    public CalculoVentaDTO calcularTotales(List<DetalleDTO> detalles, String tipoDescuento, BigDecimal valorDescuento) {
        if (detalles == null || detalles.isEmpty()) {
            throw new RuntimeException("La orden de venta debe incluir al menos un producto");
        }

        BigDecimal subtotalAcumulado = BigDecimal.ZERO;

        for (DetalleDTO item : detalles) {
            if (item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new RuntimeException("La cantidad debe ser mayor a cero");
            }

            Producto prod = productoRepo.findById(item.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + item.getProductoId()));

            BigDecimal precioRealBD = prod.getPrecioVenta();
            BigDecimal subtotalItem = precioRealBD.multiply(BigDecimal.valueOf(item.getCantidad()));
            subtotalAcumulado = subtotalAcumulado.add(subtotalItem);
        }

        BigDecimal descuentoMonto = BigDecimal.ZERO;

        if (tipoDescuento != null && valorDescuento != null && valorDescuento.compareTo(BigDecimal.ZERO) > 0) {
            if ("PORCENTAJE".equalsIgnoreCase(tipoDescuento)) {
                // Limitar máximo 50% de descuento por regla de negocio
                if (valorDescuento.compareTo(BigDecimal.valueOf(50)) > 0) {
                    throw new RuntimeException("El descuento máximo permitido por porcentaje es 50%");
                }
                descuentoMonto = subtotalAcumulado.multiply(valorDescuento)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            } else if ("MONTO".equalsIgnoreCase(tipoDescuento)) {
                if (valorDescuento.compareTo(subtotalAcumulado) >= 0) {
                    throw new RuntimeException("El monto de descuento no puede ser igual o mayor al total de la venta");
                }
                descuentoMonto = valorDescuento.setScale(2, RoundingMode.HALF_UP);
            }
        }

        BigDecimal totalFinal = subtotalAcumulado.subtract(descuentoMonto).setScale(2, RoundingMode.HALF_UP);
        subtotalAcumulado = subtotalAcumulado.setScale(2, RoundingMode.HALF_UP);

        return new CalculoVentaDTO(subtotalAcumulado, descuentoMonto, totalFinal);
    }
}
