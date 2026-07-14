package com.sistemaVentas.dataaccess;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.sistemaVentas.entity.Compra;
import java.util.Optional;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {
    Optional<Compra> findByCodigo(String codigo);
}
