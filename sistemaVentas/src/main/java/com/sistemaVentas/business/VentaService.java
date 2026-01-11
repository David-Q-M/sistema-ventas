package com.sistemaVentas.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sistemaVentas.dataaccess.*;
import com.sistemaVentas.entity.*;

import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
public class VentaService {
    @Autowired
    private VentaRepository ventaRepo;
    @Autowired
    private ProductoRepository productoRepo;
    @Autowired
    private DetalleVentaRepository detalleRepo;
    @Autowired
    private UsuarioRepository usuarioRepo;

    @Transactional(readOnly = true)
    public List<Venta> listarTodas() {
        return ventaRepo.findAll();
    }

    @Transactional
    public Venta registrarVenta(List<DetalleVenta> detalles, Long usuarioId, String tipo) {
        Venta venta = new Venta();
        venta.setTipoComprobante(tipo);
        venta.setUsuario(usuarioRepo.findById(usuarioId.intValue())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado")));

        // Inicializamos total en cero
        venta.setTotal(BigDecimal.ZERO);
        Venta guardada = ventaRepo.save(venta);
        BigDecimal totalAcumulado = BigDecimal.ZERO;

        for (DetalleVenta detalle : detalles) {
            Producto p = productoRepo.findById(detalle.getProducto().getId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            if (p.getStock() < detalle.getCantidad()) {
                throw new RuntimeException("Stock insuficiente: " + p.getNombre());
            }

            p.setStock(p.getStock() - detalle.getCantidad());
            productoRepo.save(p);

            detalle.setVenta(guardada);
            detalle.setProducto(p);
            detalle.setPrecioUnitario(p.getPrecioVenta());
            BigDecimal subtotal = p.getPrecioVenta().multiply(new BigDecimal(detalle.getCantidad()));
            detalle.setSubtotal(subtotal);
            totalAcumulado = totalAcumulado.add(subtotal);

            detalleRepo.save(detalle);
        }

        guardada.setTotal(totalAcumulado);
        return ventaRepo.save(guardada);
    }
}