package com.sistemaVentas.dataaccess;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.sistemaVentas.entity.DetalleCompra;

@Repository
public interface DetalleCompraRepository extends JpaRepository<DetalleCompra, Long> {
}
