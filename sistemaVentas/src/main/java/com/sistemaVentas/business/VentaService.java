package com.sistemaVentas.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sistemaVentas.dataaccess.*;
import com.sistemaVentas.dto.*;
import com.sistemaVentas.entity.*;
import com.sistemaVentas.strategy.MetodoPagoFactory;
import com.sistemaVentas.strategy.MetodoPagoStrategy;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
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

    @Autowired
    private InventarioService inventarioService;

    @Autowired
    private PriceCalculatorService priceCalculatorService;

    @Autowired
    private MetodoPagoFactory metodoPagoFactory;

    @Transactional(readOnly = true)
    public List<Venta> listarTodas() {
        return ventaRepo.findAll();
    }

    @Transactional(readOnly = true)
    public Venta obtenerPorId(Integer id) {
        return ventaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + id));
    }

    /**
     * RF31, RF32: Registrar Venta con Patrón Strategy y PriceCalculator.
     */
    @Transactional
    public Venta registrarVentaDTO(VentaDTO dto, String usuarioEmail) {
        if (dto.getProductos() == null || dto.getProductos().isEmpty()) {
            throw new RuntimeException("La venta debe incluir al menos un producto");
        }

        // 1. RF32: Calcular Totales y Descuentos en Backend (Cero Confianza Antimanipulación)
        CalculoVentaDTO calculo = priceCalculatorService.calcularTotales(
                dto.getProductos(), dto.getTipoDescuento(), dto.getValorDescuento());

        // 2. RF31: Procesar Pago usando el Patrón Strategy
        PagoInfoDTO pagoInfo = new PagoInfoDTO(
                dto.getMetodoPago(), dto.getMontoEntregado(), dto.getNumeroReferencia());

        MetodoPagoStrategy strategy = metodoPagoFactory.getStrategy(dto.getMetodoPago());
        ResultadoPagoDTO resultadoPago = strategy.procesarPago(calculo.getTotalFinal(), pagoInfo);

        // 3. Crear Entidad Venta (Cabecera)
        Venta venta = new Venta();
        long count = ventaRepo.count();
        String codigoVenta = String.format("VTA-%04d", count + 1);
        venta.setCodigoVenta(codigoVenta);
        venta.setFechaVenta(LocalDateTime.now());
        venta.setSubtotal(calculo.getSubtotal());
        venta.setDescuento(calculo.getDescuento());
        venta.setTotal(calculo.getTotalFinal());
        venta.setMetodoPago(resultadoPago.getMetodoPago());
        venta.setMontoEntregado(resultadoPago.getMontoEntregado());
        venta.setMontoCambio(resultadoPago.getMontoCambio());
        venta.setNumeroReferencia(resultadoPago.getNumeroReferencia());
        venta.setTipoComprobante(dto.getTipoComprobante() != null ? dto.getTipoComprobante() : "BOLETA");
        venta.setEstado("COMPLETADA");

        if (dto.getUsuarioId() != null) {
            Usuario usr = usuarioRepo.findById(dto.getUsuarioId().intValue()).orElse(null);
            venta.setUsuario(usr);
        }

        Venta guardada = ventaRepo.save(venta);
        List<DetalleVenta> detallesEntities = new ArrayList<>();

        // 4. Iterar ítems, validar stock, descontar inventario y registrar Audit Log
        for (DetalleDTO detDto : dto.getProductos()) {
            Producto prod = productoRepo.findById(detDto.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            if (prod.getStock() < detDto.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para el producto '" + prod.getNombre() + 
                        "'. Disponible: " + prod.getStock() + ", Requerido: " + detDto.getCantidad());
            }

            int stockAnterior = prod.getStock();
            int nuevoStock = stockAnterior - detDto.getCantidad();
            prod.setStock(nuevoStock);
            productoRepo.save(prod);

            // Registrar Audit Log Síncrono de Salida (RF29)
            inventarioService.registrarMovimiento(
                    prod,
                    "SALIDA",
                    detDto.getCantidad(),
                    stockAnterior,
                    nuevoStock,
                    usuarioEmail != null ? usuarioEmail : "SISTEMA_VENTAS",
                    "Venta Registrada N° " + codigoVenta + " (" + venta.getTipoComprobante() + ")"
            );

            DetalleVenta dv = new DetalleVenta();
            dv.setVenta(guardada);
            dv.setProducto(prod);
            dv.setCantidad(detDto.getCantidad());
            dv.setPrecioUnitario(prod.getPrecioVenta());
            dv.setSubtotal(prod.getPrecioVenta().multiply(BigDecimal.valueOf(detDto.getCantidad())));
            detalleRepo.save(dv);

            detallesEntities.add(dv);
        }

        guardada.setDetalles(detallesEntities);
        return ventaRepo.save(guardada);
    }

    /**
     * RF30: Devolución / Anulación de Venta (Reversión Transaccional + Audit Log).
     */
    @Transactional
    public Venta anularVenta(Integer ventaId, AnulacionVentaDTO dto, String usuarioAdmin) {
        Venta venta = obtenerPorId(ventaId);

        if ("ANULADA".equalsIgnoreCase(venta.getEstado())) {
            throw new RuntimeException("La venta N° " + venta.getCodigoVenta() + " ya se encuentra ANULADA anteriormente");
        }

        venta.setEstado("ANULADA");
        venta.setFechaAnulacion(LocalDateTime.now());
        venta.setMotivoAnulacion(dto.getMotivo());
        venta.setUsuarioAnulacion((dto.getUsuarioAdmin() != null && !dto.getUsuarioAdmin().trim().isEmpty()) 
                ? dto.getUsuarioAdmin() 
                : usuarioAdmin);

        // Reversión de Stock: Restaurar productos al inventario y generar Audit Log de entrada
        if (venta.getDetalles() != null) {
            for (DetalleVenta dv : venta.getDetalles()) {
                Producto prod = dv.getProducto();
                int stockAnterior = prod.getStock();
                int nuevoStock = stockAnterior + dv.getCantidad();
                prod.setStock(nuevoStock);
                productoRepo.save(prod);

                // Audit Log de Entrada por Reversión/Anulación
                inventarioService.registrarMovimiento(
                        prod,
                        "ENTRADA",
                        dv.getCantidad(),
                        stockAnterior,
                        nuevoStock,
                        venta.getUsuarioAnulacion(),
                        "ANULACIÓN DE VENTA N° " + (venta.getCodigoVenta() != null ? venta.getCodigoVenta() : venta.getId()) + 
                        ": " + dto.getMotivo()
                );
            }
        }

        return ventaRepo.save(venta);
    }
}