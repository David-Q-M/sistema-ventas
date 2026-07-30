package com.sistemaVentas.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.sistemaVentas.business.VentaService;
import com.sistemaVentas.dto.AnulacionVentaDTO;
import com.sistemaVentas.dto.VentaDTO;
import com.sistemaVentas.entity.Venta;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    /**
     * Historial de Ventas
     */
    @GetMapping("/historial")
    public ResponseEntity<List<Venta>> obtenerHistorial() {
        return ResponseEntity.ok(ventaService.listarTodas());
    }

    /**
     * Obtener Venta por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Venta> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(ventaService.obtenerPorId(id));
    }

    /**
     * RF31, RF32: Procesar Venta con Strategy de Pago y PriceCalculator (Cero Confianza)
     */
    @PostMapping("/procesar")
    public ResponseEntity<?> procesarVenta(@Valid @RequestBody VentaDTO ventaDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String usuarioEmail = (auth != null && auth.getName() != null) ? auth.getName() : "CAJERO";

        Venta nuevaVenta = ventaService.registrarVentaDTO(ventaDTO, usuarioEmail);
        return ResponseEntity.ok(nuevaVenta);
    }

    /**
     * RF30: Anulación / Reversión Transaccional de Venta (Requiere Autorización ADMIN)
     */
    @PostMapping("/{id}/anular")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> anularVenta(
            @PathVariable Integer id,
            @Valid @RequestBody AnulacionVentaDTO dto
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String usuarioAdmin = (auth != null && auth.getName() != null) ? auth.getName() : "ADMIN";

        Venta ventaAnulada = ventaService.anularVenta(id, dto, usuarioAdmin);
        return ResponseEntity.ok(ventaAnulada);
    }
}