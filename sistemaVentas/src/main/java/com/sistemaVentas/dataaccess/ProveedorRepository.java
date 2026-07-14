package com.sistemaVentas.dataaccess;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.sistemaVentas.entity.Proveedor;
import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    Optional<Proveedor> findByRuc(String ruc);
}
