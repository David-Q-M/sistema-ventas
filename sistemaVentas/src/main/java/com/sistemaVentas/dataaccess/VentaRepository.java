package com.sistemaVentas.dataaccess;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sistemaVentas.entity.Venta;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
}