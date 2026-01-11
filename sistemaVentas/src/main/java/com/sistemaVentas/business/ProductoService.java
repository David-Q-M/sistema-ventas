package com.sistemaVentas.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sistemaVentas.dataaccess.ProductoRepository;
import com.sistemaVentas.entity.Producto;

import java.util.List;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository repo;

    public Producto guardar(Producto producto) {
        return repo.save(producto);
    }

    public List<Producto> listar() {
        return repo.findAll();
    }

    public Producto obtenerPorId(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    public Producto actualizar(Long id, Producto productoDetalles) {
        Producto producto = obtenerPorId(id);
        producto.setNombre(productoDetalles.getNombre());
        producto.setCodigoBarras(productoDetalles.getCodigoBarras());
        producto.setDescripcion(productoDetalles.getDescripcion());
        producto.setStock(productoDetalles.getStock());
        producto.setPrecioVenta(productoDetalles.getPrecioVenta());
        producto.setUrlImagen(productoDetalles.getUrlImagen());
        producto.setCategoria(productoDetalles.getCategoria());
        return repo.save(producto);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }
}
