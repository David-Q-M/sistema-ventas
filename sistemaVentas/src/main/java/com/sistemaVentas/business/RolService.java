package com.sistemaVentas.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sistemaVentas.dataaccess.RolRepository;
import com.sistemaVentas.entity.Rol;

import java.util.List;

@Service
public class RolService {

    @Autowired
    private RolRepository repo;

    public List<Rol> listar() {
        return repo.findAll();
    }
}
