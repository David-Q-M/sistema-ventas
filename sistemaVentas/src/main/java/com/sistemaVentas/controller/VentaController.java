package com.sistemaVentas.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sistemaVentas.business.VentaService;
import com.sistemaVentas.dto.VentaDTO;
import com.sistemaVentas.entity.Venta;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    // Historial de Ventas (R del CRUD)
    @GetMapping("/historial")
    public List<Venta> obtenerHistorial() {
        return ventaService.listarTodas();
    }

    @PostMapping("/procesar")
    public ResponseEntity<?> procesar(@Valid @RequestBody VentaDTO ventaDTO) {
        try {
            java.util.List<com.sistemaVentas.entity.DetalleVenta> detalles = ventaDTO.getProductos().stream().map(d -> {
                com.sistemaVentas.entity.DetalleVenta dv = new com.sistemaVentas.entity.DetalleVenta();
                com.sistemaVentas.entity.Producto p = new com.sistemaVentas.entity.Producto();
                p.setId(d.getProductoId());
                dv.setProducto(p);
                dv.setCantidad(d.getCantidad());
                return dv;
            }).toList();

            Venta nuevaVenta = ventaService.registrarVenta(detalles, ventaDTO.getUsuarioId(),
                    ventaDTO.getTipoComprobante());
            return ResponseEntity.ok(nuevaVenta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}