package com.sistemaVentas;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.sistemaVentas.dataaccess.*;
import com.sistemaVentas.entity.*;

@SpringBootApplication
@EnableScheduling
public class SistemaVentasApplication {

	public static void main(String[] args) {
		SpringApplication.run(SistemaVentasApplication.class, args);
	}

	@Bean
	public CommandLineRunner initDatabase(
			UsuarioRepository usuarioRepo,
			ProductoRepository productoRepo,
			CategoriaRepository categoriaRepo,
			RolRepository rolRepo,
			PasswordEncoder passwordEncoder) {
		return args -> {
			System.out.println("====== VERIFICACIÓN Y RESETEO DE BASE DE DATOS ======");
			try {
				System.out.println("Usuarios en BD: " + usuarioRepo.count());
				System.out.println("Productos en BD: " + productoRepo.count());
				System.out.println("Categorías en BD: " + categoriaRepo.count());
				System.out.println("Roles en BD: " + rolRepo.count());
				
				// Resetear contraseñas para asegurar el acceso
				usuarioRepo.findByUsername("admin").ifPresent(u -> {
					u.setPassword(passwordEncoder.encode("admin123"));
					usuarioRepo.save(u);
					System.out.println(" -> Contraseña del usuario 'admin' reseteada a: admin123");
				});

				usuarioRepo.findByUsername("david").ifPresent(u -> {
					u.setPassword(passwordEncoder.encode("david123"));
					usuarioRepo.save(u);
					System.out.println(" -> Contraseña del usuario 'david' reseteada a: david123");
				});
				
				// Listar usuarios registrados
				usuarioRepo.findAll().forEach(u -> {
					System.out.println(" -> Usuario registrado: Username=" + u.getUsername() + ", NombreCompleto=" + u.getNombreCompleto() + ", Activo=" + u.getActivo() + ", Rol=" + (u.getRol() != null ? u.getRol().getNombre() : "null"));
				});
			} catch (Exception e) {
				System.err.println("Error al consultar/actualizar la BD: " + e.getMessage());
				e.printStackTrace();
			}
			System.out.println("=====================================================");
		};
	}
}
