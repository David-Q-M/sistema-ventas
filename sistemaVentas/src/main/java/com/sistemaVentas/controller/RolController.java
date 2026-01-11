package com.sistemaVentas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sistemaVentas.business.RolService;
import com.sistemaVentas.entity.Rol;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin("*")
public class RolController {

    @Autowired
    private RolService service;

    @GetMapping("/listar")
    public ResponseEntity<List<Rol>> listar() {
        return ResponseEntity.ok(service.listar());
    }
}
