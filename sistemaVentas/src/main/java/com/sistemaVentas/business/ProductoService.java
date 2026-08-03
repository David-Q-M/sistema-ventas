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

    @Autowired
    private com.sistemaVentas.dataaccess.CatalogoProveedorRepository catalogoRepo;

    public Producto guardar(Producto producto) {
        if (producto.getCodigoBarras() != null && producto.getCodigoBarras().trim().isEmpty()) {
            producto.setCodigoBarras(null);
        }
        return repo.save(producto);
    }

    public List<Producto> listar() {
        return repo.findAll();
    }

    public List<Producto> listarPorProveedor(Long proveedorId) {
        List<Producto> directos = repo.findByProveedorId(proveedorId);
        List<com.sistemaVentas.entity.CatalogoProveedor> catalogo = catalogoRepo.findByProveedorIdAndEsActivoTrue(proveedorId);
        
        java.util.Set<Long> prodIds = directos.stream()
                .filter(p -> p.getId() != null)
                .map(Producto::getId)
                .collect(java.util.stream.Collectors.toSet());
        
        List<Producto> resultado = new java.util.ArrayList<>(directos);
        for (com.sistemaVentas.entity.CatalogoProveedor cp : catalogo) {
            if (cp.getProducto() != null && cp.getProducto().getId() != null && !prodIds.contains(cp.getProducto().getId())) {
                resultado.add(cp.getProducto());
                prodIds.add(cp.getProducto().getId());
            }
        }
        return resultado;
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

    @org.springframework.transaction.annotation.Transactional
    public void eliminar(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("El producto no existe");
        }
        try {
            // Eliminar referencias en detalles de compras y ventas de forma segura
            detalleVentaRepo.deleteByProductoId(id);
            detalleCompraRepo.deleteByProductoId(id);

            // Eliminar el producto de la base de datos
            repo.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar el producto: " + e.getMessage());
        }
    }
}

