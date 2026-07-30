package com.sistemaVentas.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sistemaVentas.business.ProveedorService;
import com.sistemaVentas.dto.ProveedorRequestDTO;
import com.sistemaVentas.dto.ProveedorResponseDTO;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {

    @Autowired
    private ProveedorService service;

    @GetMapping("/listar")
    public ResponseEntity<List<ProveedorResponseDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/listar-activos")
    public ResponseEntity<List<ProveedorResponseDTO>> listarActivos() {
        return ResponseEntity.ok(service.listarActivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProveedorResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorIdDTO(id));
    }

    @PostMapping("/guardar")
    public ResponseEntity<ProveedorResponseDTO> guardar(@Valid @RequestBody ProveedorRequestDTO dto) {
        ProveedorResponseDTO creado = service.guardarDTO(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProveedorResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProveedorRequestDTO dto) {
        return ResponseEntity.ok(service.actualizarDTO(id, dto));
    }

    /**
     * RF24: Eliminación Lógica / Desactivar Proveedor (Soft Delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ProveedorResponseDTO> eliminar(@PathVariable Long id) {
        ProveedorResponseDTO desactivado = service.desactivar(id);
        return ResponseEntity.ok(desactivado);
    }

    /**
     * Cambiar estado activo/inactivo dinámicamente
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<ProveedorResponseDTO> cambiarEstado(
            @PathVariable Long id,
            @RequestParam Boolean activo) {
        return ResponseEntity.ok(service.cambiarEstado(id, activo));
    }
}
