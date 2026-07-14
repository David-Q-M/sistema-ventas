package com.sistemaVentas.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sistemaVentas.dataaccess.ProveedorRepository;
import com.sistemaVentas.entity.Proveedor;
import java.util.List;

@Service
public class ProveedorService {

    @Autowired
    private ProveedorRepository repo;

    @Transactional(readOnly = true)
    public List<Proveedor> listar() {
        return repo.findAll();
    }

    @Transactional(readOnly = true)
    public Proveedor obtenerPorId(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
    }

    @Transactional
    public Proveedor guardar(Proveedor p) {
        return repo.save(p);
    }

    @Transactional
    public Proveedor actualizar(Long id, Proveedor detalles) {
        Proveedor p = obtenerPorId(id);
        p.setNombre(detalles.getNombre());
        p.setRuc(detalles.getRuc());
        p.setContacto(detalles.getContacto());
        p.setTelefono(detalles.getTelefono());
        p.setDireccion(detalles.getDireccion());
        p.setCategoria(detalles.getCategoria());
        p.setEmail(detalles.getEmail());
        p.setActivo(detalles.getActivo());
        if (detalles.getUltimaOrden() != null) {
            p.setUltimaOrden(detalles.getUltimaOrden());
        }
        if (detalles.getMontoTotal() != null) {
            p.setMontoTotal(detalles.getMontoTotal());
        }
        if (detalles.getDiasPago() != null) {
            p.setDiasPago(detalles.getDiasPago());
        }
        return repo.save(p);
    }

    @Transactional
    public void eliminar(Long id) {
        repo.deleteById(id);
    }
}
