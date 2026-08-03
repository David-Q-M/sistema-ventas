package com.sistemaVentas.dataaccess;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.sistemaVentas.entity.Compra;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {
    Optional<Compra> findByCodigo(String codigo);
    List<Compra> findByEstado(String estado);
    List<Compra> findByEstadoAndFechaEntregaLessThanEqual(String estado, LocalDate fechaEntrega);
}
