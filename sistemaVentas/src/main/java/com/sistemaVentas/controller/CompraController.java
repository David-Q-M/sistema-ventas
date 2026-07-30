package com.sistemaVentas.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sistemaVentas.business.CompraService;
import com.sistemaVentas.dto.CompraRequestDTO;
import com.sistemaVentas.dto.CompraResponseDTO;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/compras")
public class CompraController {

    @Autowired
    private CompraService service;

    @GetMapping("/listar")
    public ResponseEntity<List<CompraResponseDTO>> listar() {
        return ResponseEntity.ok(service.listarTodasDTO());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompraResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorIdDTO(id));
    }

    /**
     * RF25, RF26, RF27: Endpoint para registrar compra con detalle anidado y actualización de inventario.
     */
    @PostMapping("/guardar")
    public ResponseEntity<CompraResponseDTO> guardar(@Valid @RequestBody CompraRequestDTO dto) {
        CompraResponseDTO creada = service.registrarDTO(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<CompraResponseDTO> actualizarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null || nuevoEstado.trim().isEmpty()) {
            throw new IllegalArgumentException("El nuevo estado es obligatorio");
        }
        return ResponseEntity.ok(service.actualizarEstadoDTO(id, nuevoEstado));
    }
}
