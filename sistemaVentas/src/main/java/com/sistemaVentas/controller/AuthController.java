package com.sistemaVentas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sistemaVentas.dataaccess.UsuarioRepository;
import com.sistemaVentas.entity.Usuario;
import com.sistemaVentas.security.JwtUtil;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepo;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        Usuario user = usuarioRepo.findByUsername(request.get("username"))
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getPassword().equals(request.get("password"))) { // Nota: Usar BCrypt en producción
            String token = jwtUtil.generateToken(user.getUsername(), user.getRol().getNombre());
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "rol", user.getRol().getNombre(),
                    "id", user.getId().toString()));
        }
        return ResponseEntity.status(401).body("Credenciales inválidas");
    }
}