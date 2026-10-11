package com.sistemaVentas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SistemaVentasApplication {

	public static void main(String[] args) {
		SpringApplication.run(SistemaVentasApplication.class, args);
	}
}

