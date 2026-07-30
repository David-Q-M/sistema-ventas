package com.sistemaVentas.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.sistemaVentas.business.InventarioService;
import com.sistemaVentas.dto.AjusteStockDTO;
import com.sistemaVentas.dto.AlertaVencimientoDTO;
import com.sistemaVentas.entity.MovimientoInventario;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/inventario")
public class InventarioController {

    @Autowired
    private InventarioService inventarioService;

    /**
     * RF28: Listar Alertas de Vencimiento de Productos (Control de Semáforo)
     */
    @GetMapping("/vencimientos")
    public ResponseEntity<List<AlertaVencimientoDTO>> listarAlertasVencimiento() {
        return ResponseEntity.ok(inventarioService.obtenerAlertasVencimiento());
    }

    /**
     * RF29: Consultar Historial de Movimientos de Inventario con Paginación Obligatoria (Audit Log)
     */
    @GetMapping("/movimientos")
    public ResponseEntity<Page<MovimientoInventario>> listarMovimientosPaginados(
            @RequestParam(required = false) Long productoId,
            @RequestParam(required = false) String tipoMovimiento,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MovimientoInventario> resultado = inventarioService.obtenerMovimientosPaginados(
                productoId, tipoMovimiento, fechaInicio, fechaFin, pageable);
        return ResponseEntity.ok(resultado);
    }

    /**
     * RF29: Ajuste Manual de Inventario Auditado
     */
    @PostMapping("/ajuste")
    public ResponseEntity<?> ajustarStockManual(@Valid @RequestBody AjusteStockDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String usuarioActual = (auth != null && auth.getName() != null) ? auth.getName() : "ALMACEN";

        inventarioService.ajustarStockManual(dto, usuarioActual);
        return ResponseEntity.ok().body("{\"message\": \"Stock ajustado y movimiento registrado en auditoría correctamente.\"}");
    }
}
