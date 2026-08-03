package com.sistemaVentas.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sistemaVentas.business.CatalogoProveedorService;
import com.sistemaVentas.dto.CatalogoProveedorRequestDTO;
import com.sistemaVentas.dto.CatalogoProveedorResponseDTO;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo-proveedor")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CatalogoProveedorController {

    @Autowired
    private CatalogoProveedorService service;

    @GetMapping("/proveedor/{proveedorId}")
    public ResponseEntity<List<CatalogoProveedorResponseDTO>> listarPorProveedor(@PathVariable Long proveedorId) {
        return ResponseEntity.ok(service.listarPorProveedor(proveedorId));
    }

    @GetMapping("/proveedor/{proveedorId}/activos")
    public ResponseEntity<List<CatalogoProveedorResponseDTO>> listarActivosPorProveedor(@PathVariable Long proveedorId) {
        return ResponseEntity.ok(service.listarActivosPorProveedor(proveedorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CatalogoProveedorResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<CatalogoProveedorResponseDTO> guardar(@Valid @RequestBody CatalogoProveedorRequestDTO dto) {
        CatalogoProveedorResponseDTO creado = service.guardarOCrear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CatalogoProveedorResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CatalogoProveedorRequestDTO dto) {
        return ResponseEntity.ok(service.actualizar(id, dto));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<CatalogoProveedorResponseDTO> cambiarEstado(
            @PathVariable Long id,
            @RequestParam Boolean activo) {
        return ResponseEntity.ok(service.cambiarEstado(id, activo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
