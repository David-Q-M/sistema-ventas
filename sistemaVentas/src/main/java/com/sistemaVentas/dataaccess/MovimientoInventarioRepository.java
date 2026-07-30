package com.sistemaVentas.dataaccess;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sistemaVentas.entity.MovimientoInventario;

import java.time.LocalDateTime;

@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

    @Query("SELECT m FROM MovimientoInventario m WHERE " +
           "(:productoId IS NULL OR m.producto.id = :productoId) AND " +
           "(:tipoMovimiento IS NULL OR m.tipoMovimiento = :tipoMovimiento) AND " +
           "(:fechaInicio IS NULL OR m.fecha >= :fechaInicio) AND " +
           "(:fechaFin IS NULL OR m.fecha <= :fechaFin) " +
           "ORDER BY m.fecha DESC")
    Page<MovimientoInventario> buscarConFiltrosPaginados(
            @Param("productoId") Long productoId,
            @Param("tipoMovimiento") String tipoMovimiento,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin,
            Pageable pageable
    );
}
