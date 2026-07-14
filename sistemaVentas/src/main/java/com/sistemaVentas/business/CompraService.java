package com.sistemaVentas.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sistemaVentas.dataaccess.CompraRepository;
import com.sistemaVentas.dataaccess.ProductoRepository;
import com.sistemaVentas.dataaccess.ProveedorRepository;
import com.sistemaVentas.entity.Compra;
import com.sistemaVentas.entity.DetalleCompra;
import com.sistemaVentas.entity.Producto;
import com.sistemaVentas.entity.Proveedor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class CompraService {

    @Autowired
    private CompraRepository compraRepo;

    @Autowired
    private ProductoRepository productoRepo;

    @Autowired
    private ProveedorRepository proveedorRepo;

    @Transactional(readOnly = true)
    public List<Compra> listarTodas() {
        return compraRepo.findAll();
    }

    @Transactional(readOnly = true)
    public Compra obtenerPorId(Long id) {
        return compraRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Compra no encontrada"));
    }

    @Transactional
    public Compra registrar(Compra compra) {
        // Generar código autoincremental de compra
        long count = compraRepo.count();
        compra.setCodigo(String.format("CMP-%04d", count + 1));
        
        if (compra.getFechaPedido() == null) {
            compra.setFechaPedido(LocalDate.now());
        }

        // Cargar proveedor
        Proveedor prov = proveedorRepo.findById(compra.getProveedor().getId())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
        compra.setProveedor(prov);

        BigDecimal totalAcumulado = BigDecimal.ZERO;

        for (DetalleCompra detalle : compra.getDetalles()) {
            Producto prod = productoRepo.findById(detalle.getProducto().getId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
            
            detalle.setCompra(compra);
            detalle.setProducto(prod);
            
            BigDecimal subtotal = detalle.getPrecioCosto().multiply(BigDecimal.valueOf(detalle.getCantidad()));
            detalle.setSubtotal(subtotal);
            totalAcumulado = totalAcumulado.add(subtotal);

            // Si se registra como RECIBIDO directamente, actualizamos stock e indexamos proveedor al producto
            if ("RECIBIDO".equalsIgnoreCase(compra.getEstado())) {
                prod.setStock(prod.getStock() + detalle.getCantidad());
                prod.setProveedor(prov);
                productoRepo.save(prod);
            }
        }

        compra.setMontoTotal(totalAcumulado);
        
        // Actualizar estadísticas del proveedor si la orden es recibida
        if ("RECIBIDO".equalsIgnoreCase(compra.getEstado())) {
            prov.setUltimaOrden(compra.getFechaPedido());
            prov.setMontoTotal(prov.getMontoTotal().add(totalAcumulado));
            proveedorRepo.save(prov);
        }

        return compraRepo.save(compra);
    }

    @Transactional
    public Compra actualizarEstado(Long id, String nuevoEstado) {
        Compra compra = obtenerPorId(id);
        String estadoAnterior = compra.getEstado();
        
        if (estadoAnterior.equalsIgnoreCase(nuevoEstado)) {
            return compra;
        }

        compra.setEstado(nuevoEstado);
        
        // Si cambia a RECIBIDO, incrementamos stock y acumulamos en el proveedor
        if ("RECIBIDO".equalsIgnoreCase(nuevoEstado)) {
            Proveedor prov = compra.getProveedor();
            prov.setUltimaOrden(compra.getFechaPedido());
            prov.setMontoTotal(prov.getMontoTotal().add(compra.getMontoTotal()));
            proveedorRepo.save(prov);

            for (DetalleCompra detalle : compra.getDetalles()) {
                Producto prod = detalle.getProducto();
                prod.setStock(prod.getStock() + detalle.getCantidad());
                prod.setProveedor(prov);
                productoRepo.save(prod);
            }
        } 
        // Si pasa de RECIBIDO a CANCELADO, descontamos del stock y restamos del total del proveedor
        else if ("RECIBIDO".equalsIgnoreCase(estadoAnterior) && "CANCELADO".equalsIgnoreCase(nuevoEstado)) {
            Proveedor prov = compra.getProveedor();
            prov.setMontoTotal(prov.getMontoTotal().subtract(compra.getMontoTotal()));
            proveedorRepo.save(prov);

            for (DetalleCompra detalle : compra.getDetalles()) {
                Producto prod = detalle.getProducto();
                prod.setStock(Math.max(0, prod.getStock() - detalle.getCantidad()));
                productoRepo.save(prod);
            }
        }

        return compraRepo.save(compra);
    }
}
