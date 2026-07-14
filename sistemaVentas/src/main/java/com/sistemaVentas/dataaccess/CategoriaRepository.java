package com.sistemaVentas.dataaccess;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sistemaVentas.entity.Categoria;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
}
