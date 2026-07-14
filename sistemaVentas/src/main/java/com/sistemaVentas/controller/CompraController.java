package com.sistemaVentas.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sistemaVentas.business.CompraService;
import com.sistemaVentas.entity.Compra;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/compras")
public class CompraController {

    @Autowired
    private CompraService service;

    @GetMapping("/listar")
    public ResponseEntity<List<Compra>> listar() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Compra> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @PostMapping("/guardar")
    public ResponseEntity<Compra> guardar(@Valid @RequestBody Compra compra) {
        return ResponseEntity.ok(service.registrar(compra));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Compra> actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null || nuevoEstado.trim().isEmpty()) {
            throw new IllegalArgumentException("El estado es obligatorio");
        }
        return ResponseEntity.ok(service.actualizarEstado(id, nuevoEstado));
    }
}
