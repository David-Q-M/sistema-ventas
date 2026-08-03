package com.sistemaVentas.dataaccess;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.sistemaVentas.entity.CatalogoProveedor;

import java.util.List;
import java.util.Optional;

@Repository
public interface CatalogoProveedorRepository extends JpaRepository<CatalogoProveedor, Long> {
    List<CatalogoProveedor> findByProveedorId(Long proveedorId);
    List<CatalogoProveedor> findByProveedorIdAndEsActivoTrue(Long proveedorId);
    Optional<CatalogoProveedor> findByProveedorIdAndProductoId(Long proveedorId, Long productoId);
    boolean existsByProveedorIdAndProductoId(Long proveedorId, Long productoId);
}
