package com.sistemaVentas.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.sistemaVentas.dataaccess.DetalleCompraRepository;
import com.sistemaVentas.dataaccess.DetalleVentaRepository;
import com.sistemaVentas.dataaccess.ProductoRepository;
import com.sistemaVentas.entity.Producto;

import java.util.List;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository repo;

    @Autowired
    private DetalleVentaRepository detalleVentaRepo;

    @Autowired
    private DetalleCompraRepository detalleCompraRepo;

    public Producto guardar(Producto producto) {
        if (producto.getCodigoBarras() != null && producto.getCodigoBarras().trim().isEmpty()) {
            producto.setCodigoBarras(null);
        }
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

        String codigo = productoDetalles.getCodigoBarras();
        producto.setCodigoBarras((codigo != null && codigo.trim().isEmpty()) ? null : codigo);

        producto.setDescripcion(productoDetalles.getDescripcion());
        producto.setStock(productoDetalles.getStock());
        producto.setPrecioVenta(productoDetalles.getPrecioVenta());
        producto.setUrlImagen(productoDetalles.getUrlImagen());
        producto.setCategoria(productoDetalles.getCategoria());
        return repo.save(producto);
    }

    public void eliminar(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("El producto no existe");
        }
        if (detalleVentaRepo.existsByProductoId(id)) {
            throw new RuntimeException("No se puede eliminar el producto porque tiene ventas asociadas en el historial.");
        }
        if (detalleCompraRepo.existsByProductoId(id)) {
            throw new RuntimeException("No se puede eliminar el producto porque tiene compras registradas en el historial.");
        }
        try {
            repo.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("No se puede eliminar el producto porque está referenciado en otros registros del sistema.");
        }
    }
}

