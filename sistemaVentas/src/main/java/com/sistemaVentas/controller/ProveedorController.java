package com.sistemaVentas.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sistemaVentas.business.ProveedorService;
import com.sistemaVentas.entity.Proveedor;
import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {

    @Autowired
    private ProveedorService service;

    @GetMapping("/listar")
    public ResponseEntity<List<Proveedor>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Proveedor> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @PostMapping("/guardar")
    public ResponseEntity<Proveedor> guardar(@Valid @RequestBody Proveedor p) {
        return ResponseEntity.ok(service.guardar(p));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Proveedor> actualizar(@PathVariable Long id, @Valid @RequestBody Proveedor p) {
        return ResponseEntity.ok(service.actualizar(id, p));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
