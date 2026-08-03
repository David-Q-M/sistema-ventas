package com.sistemaVentas.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sistemaVentas.dataaccess.CompraRepository;
import com.sistemaVentas.dataaccess.ProductoRepository;
import com.sistemaVentas.dataaccess.ProveedorRepository;
import com.sistemaVentas.dto.CompraRequestDTO;
import com.sistemaVentas.dto.CompraResponseDTO;
import com.sistemaVentas.dto.DetalleCompraRequestDTO;
import com.sistemaVentas.dto.DetalleCompraResponseDTO;
import com.sistemaVentas.entity.Compra;
import com.sistemaVentas.entity.DetalleCompra;
import com.sistemaVentas.entity.Producto;
import com.sistemaVentas.entity.Proveedor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompraService {

    @Autowired
    private CompraRepository compraRepo;

    @Autowired
    private ProductoRepository productoRepo;

    @Autowired
    private ProveedorRepository proveedorRepo;

    @Autowired
    private CatalogoProveedorRepository catalogoProveedorRepo;

    @Autowired
    private InventarioService inventarioService;

    @Transactional(readOnly = true)
    public List<CompraResponseDTO> listarTodasDTO() {
        return compraRepo.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompraResponseDTO obtenerPorIdDTO(Long id) {
        Compra compra = obtenerPorIdEntity(id);
        return mapToResponseDTO(compra);
    }

    @Transactional(readOnly = true)
    public Compra obtenerPorIdEntity(Long id) {
        return compraRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Compra no encontrada con ID: " + id));
    }

    /**
     * RF25, RF26, RF27: Registro Transaccional Atómico de Compra y Actualización de Inventario.
     * Si cualquier paso o validación falla, se realiza un rollback automático de la transacción.
     */
    @Transactional(rollbackFor = Exception.class)
    public CompraResponseDTO registrarDTO(CompraRequestDTO dto) {
        // 1. Validar existencia de Proveedor
        Proveedor prov = proveedorRepo.findById(dto.getProveedorId())
                .orElseThrow(() -> new RuntimeException("El proveedor especificado no existe."));

        // 2. REGLA DE NEGOCIO: Validar que el Proveedor esté ACTIVO
        if (!Boolean.TRUE.equals(prov.getActivo())) {
            throw new RuntimeException("El proveedor '" + prov.getNombre() + "' está INACTIVO. No es posible generar órdenes de compra a proveedores deshabilitados.");
        }

        // 3. Crear entidad Compra (Cabecera)
        Compra compra = new Compra();
        long count = compraRepo.count();
        compra.setCodigo(String.format("CMP-%04d", count + 1));
        compra.setProveedor(prov);
        compra.setFechaPedido(dto.getFechaPedido() != null ? dto.getFechaPedido() : LocalDate.now());
        compra.setFechaEntrega(dto.getFechaEntrega());
        compra.setMetodoPedido(dto.getMetodoPedido() != null ? dto.getMetodoPedido() : "Llamada Telefónica");
        compra.setEstadoPago(dto.getEstadoPago() != null ? dto.getEstadoPago() : "Contado");
        compra.setEstado(dto.getEstado() != null ? dto.getEstado() : "PENDIENTE");
        compra.setObservacion(dto.getObservacion());

        BigDecimal totalAcumulado = BigDecimal.ZERO;
        List<DetalleCompra> detallesEntities = new ArrayList<>();

        // 4. Iterar y procesar cada ítem del Detalle
        for (DetalleCompraRequestDTO detDto : dto.getDetalles()) {
            Producto prod = productoRepo.findById(detDto.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto con ID " + detDto.getProductoId() + " no encontrado en el inventario."));

            // Validar valores mayores a cero
            if (detDto.getCantidad() == null || detDto.getCantidad() <= 0) {
                throw new RuntimeException("La cantidad comprada para el producto '" + prod.getNombre() + "' debe ser mayor a cero.");
            }
            if (detDto.getPrecioCosto() == null || detDto.getPrecioCosto().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("El precio de costo para el producto '" + prod.getNombre() + "' debe ser mayor a cero.");
            }

            DetalleCompra detalle = new DetalleCompra();
            detalle.setCompra(compra);
            detalle.setProducto(prod);
            detalle.setCantidad(detDto.getCantidad());
            detalle.setPrecioCosto(detDto.getPrecioCosto());

            BigDecimal subtotal = detDto.getPrecioCosto().multiply(BigDecimal.valueOf(detDto.getCantidad()));
            detalle.setSubtotal(subtotal);
            detalle.setObservacion(detDto.getObservacion());

            detallesEntities.add(detalle);
            totalAcumulado = totalAcumulado.add(subtotal);

            // 5. RF27 & RF29: ACTUALIZACIÓN AUTOMÁTICA DE INVENTARIO Y AUDIT LOG SOLO SI NACE COMO RECIBIDO
            if ("RECIBIDO".equalsIgnoreCase(compra.getEstado())) {
                int stockAnterior = prod.getStock() != null ? prod.getStock() : 0;
                int nuevoStock = stockAnterior + detDto.getCantidad();
                prod.setStock(nuevoStock);
                prod.setProveedor(prov);
                productoRepo.save(prod);

                // Sincronizar catálogo del proveedor
                if (prov != null && prod != null) {
                    catalogoProveedorRepo.findByProveedorIdAndProductoId(prov.getId(), prod.getId())
                            .ifPresent(cp -> {
                                int sCp = cp.getStockActual() != null ? cp.getStockActual() : 0;
                                cp.setStockActual(sCp + detDto.getCantidad());
                                cp.setPrecioCosto(detDto.getPrecioCosto());
                                catalogoProveedorRepo.save(cp);
                            });
                }

                // Audit Log en MovimientoInventario
                inventarioService.registrarMovimiento(
                        prod,
                        "ENTRADA",
                        detDto.getCantidad(),
                        stockAnterior,
                        nuevoStock,
                        "SISTEMA_COMPRAS",
                        "Compra Registrada N° " + compra.getCodigo() + " a " + prov.getNombre()
                );
            }
        }

        compra.setDetalles(detallesEntities);
        compra.setMontoTotal(totalAcumulado);

        // 6. Actualizar estadísticas acumuladas del Proveedor si NACE como RECIBIDO
        if ("RECIBIDO".equalsIgnoreCase(compra.getEstado())) {
            prov.setUltimaOrden(compra.getFechaPedido());
            BigDecimal acumuladoActual = prov.getMontoTotal() != null ? prov.getMontoTotal() : BigDecimal.ZERO;
            prov.setMontoTotal(acumuladoActual.add(totalAcumulado));
            proveedorRepo.save(prov);
        }

        Compra guardada = compraRepo.save(compra);
        return mapToResponseDTO(guardada);
    }

    @Transactional(rollbackFor = Exception.class)
    public CompraResponseDTO actualizarEstadoDTO(Long id, String nuevoEstado) {
        Compra compra = obtenerPorIdEntity(id);
        String estadoAnterior = compra.getEstado();

        if (estadoAnterior.equalsIgnoreCase(nuevoEstado)) {
            return mapToResponseDTO(compra);
        }

        compra.setEstado(nuevoEstado);

        // Transición a RECIBIDO: Incrementar stock y audit log
        if ("RECIBIDO".equalsIgnoreCase(nuevoEstado)) {
            Proveedor prov = compra.getProveedor();
            if (prov != null) {
                prov.setUltimaOrden(compra.getFechaPedido());
                BigDecimal acumuladoActual = prov.getMontoTotal() != null ? prov.getMontoTotal() : BigDecimal.ZERO;
                prov.setMontoTotal(acumuladoActual.add(compra.getMontoTotal() != null ? compra.getMontoTotal() : BigDecimal.ZERO));
                proveedorRepo.save(prov);
            }

            for (DetalleCompra detalle : compra.getDetalles()) {
                Producto prod = detalle.getProducto();
                int stockAnterior = prod.getStock() != null ? prod.getStock() : 0;
                int nuevoStock = stockAnterior + detalle.getCantidad();
                prod.setStock(nuevoStock);
                if (prov != null) {
                    prod.setProveedor(prov);
                    catalogoProveedorRepo.findByProveedorIdAndProductoId(prov.getId(), prod.getId())
                            .ifPresent(cp -> {
                                int sCp = cp.getStockActual() != null ? cp.getStockActual() : 0;
                                cp.setStockActual(sCp + detalle.getCantidad());
                                cp.setPrecioCosto(detalle.getPrecioCosto());
                                catalogoProveedorRepo.save(cp);
                            });
                }
                productoRepo.save(prod);

                inventarioService.registrarMovimiento(
                        prod,
                        "ENTRADA",
                        detalle.getCantidad(),
                        stockAnterior,
                        nuevoStock,
                        "SISTEMA_COMPRAS",
                        "Recepción de Orden N° " + compra.getCodigo() + (prov != null ? " de " + prov.getNombre() : "")
                );
            }
        }
        // Transición de RECIBIDO a CANCELADO: Revertir stock y acumulado de proveedor
        else if ("RECIBIDO".equalsIgnoreCase(estadoAnterior) && "CANCELADO".equalsIgnoreCase(nuevoEstado)) {
            Proveedor prov = compra.getProveedor();
            if (prov != null && prov.getMontoTotal() != null) {
                prov.setMontoTotal(prov.getMontoTotal().subtract(compra.getMontoTotal() != null ? compra.getMontoTotal() : BigDecimal.ZERO));
                proveedorRepo.save(prov);
            }

            for (DetalleCompra detalle : compra.getDetalles()) {
                Producto prod = detalle.getProducto();
                int stockAnterior = prod.getStock() != null ? prod.getStock() : 0;
                int nuevoStock = Math.max(0, stockAnterior - detalle.getCantidad());
                prod.setStock(nuevoStock);
                if (prov != null) {
                    catalogoProveedorRepo.findByProveedorIdAndProductoId(prov.getId(), prod.getId())
                            .ifPresent(cp -> {
                                int sCp = cp.getStockActual() != null ? cp.getStockActual() : 0;
                                cp.setStockActual(Math.max(0, sCp - detalle.getCantidad()));
                                catalogoProveedorRepo.save(cp);
                            });
                }
                productoRepo.save(prod);

                inventarioService.registrarMovimiento(
                        prod,
                        "SALIDA",
                        detalle.getCantidad(),
                        stockAnterior,
                        nuevoStock,
                        "SISTEMA_COMPRAS",
                        "Cancelación de Compra N° " + compra.getCodigo()
                );
            }
        }

        Compra actualizada = compraRepo.save(compra);
        return mapToResponseDTO(actualizada);
    }

    // --- Métodos de compatibilidad de entidad ---
    @Transactional(readOnly = true)
    public List<Compra> listarTodas() {
        return compraRepo.findAll();
    }

    @Transactional(readOnly = true)
    public Compra obtenerPorId(Long id) {
        return obtenerPorIdEntity(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public Compra registrar(Compra compra) {
        Proveedor prov = proveedorRepo.findById(compra.getProveedor().getId())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
        if (!Boolean.TRUE.equals(prov.getActivo())) {
            throw new RuntimeException("El proveedor " + prov.getNombre() + " se encuentra inactivo.");
        }
        long count = compraRepo.count();
        compra.setCodigo(String.format("CMP-%04d", count + 1));
        if (compra.getFechaPedido() == null) {
            compra.setFechaPedido(LocalDate.now());
        }
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

            if ("RECIBIDO".equalsIgnoreCase(compra.getEstado())) {
                prod.setStock(prod.getStock() + detalle.getCantidad());
                prod.setProveedor(prov);
                productoRepo.save(prod);
            }
        }
        compra.setMontoTotal(totalAcumulado);
        if ("RECIBIDO".equalsIgnoreCase(compra.getEstado())) {
            prov.setUltimaOrden(compra.getFechaPedido());
            BigDecimal acum = prov.getMontoTotal() != null ? prov.getMontoTotal() : BigDecimal.ZERO;
            prov.setMontoTotal(acum.add(totalAcumulado));
            proveedorRepo.save(prov);
        }
        return compraRepo.save(compra);
    }

    @Transactional(rollbackFor = Exception.class)
    public Compra actualizarEstado(Long id, String nuevoEstado) {
        CompraResponseDTO res = actualizarEstadoDTO(id, nuevoEstado);
        return obtenerPorIdEntity(res.getId());
    }

    /**
     * Tarea diferida de procesamiento de stock para entregas 'Just-in-Time'.
     * Busca órdenes PENDIENTE con fechaEntrega <= hoy y las transiciona a RECIBIDO.
     */
    @Transactional(rollbackFor = Exception.class)
    public int procesarEntregasPendientes() {
        LocalDate hoy = LocalDate.now();
        List<Compra> pendientes = compraRepo.findByEstadoAndFechaEntregaLessThanEqual("PENDIENTE", hoy);
        int procesadasCount = 0;

        for (Compra c : pendientes) {
            try {
                actualizarEstadoDTO(c.getId(), "RECIBIDO");
                procesadasCount++;
            } catch (Exception e) {
                System.err.println("Error procesando entrega automática para la orden de compra CMP-ID " + c.getId() + ": " + e.getMessage());
            }
        }
        return procesadasCount;
    }

    // Mapper Helpers
    private CompraResponseDTO mapToResponseDTO(Compra entity) {
        CompraResponseDTO dto = new CompraResponseDTO();
        dto.setId(entity.getId());
        dto.setCodigo(entity.getCodigo());
        if (entity.getProveedor() != null) {
            dto.setProveedorId(entity.getProveedor().getId());
            dto.setProveedorNombre(entity.getProveedor().getNombre());
            dto.setProveedorRuc(entity.getProveedor().getRuc());
        }
        dto.setFechaPedido(entity.getFechaPedido());
        dto.setFechaEntrega(entity.getFechaEntrega());
        dto.setMetodoPedido(entity.getMetodoPedido());
        dto.setEstadoPago(entity.getEstadoPago());
        dto.setMontoTotal(entity.getMontoTotal());
        dto.setEstado(entity.getEstado());
        dto.setObservacion(entity.getObservacion());

        if (entity.getDetalles() != null) {
            List<DetalleCompraResponseDTO> detallesDto = entity.getDetalles().stream().map(d -> {
                DetalleCompraResponseDTO detDto = new DetalleCompraResponseDTO();
                detDto.setId(d.getId());
                if (d.getProducto() != null) {
                    detDto.setProductoId(d.getProducto().getId());
                    detDto.setProductoNombre(d.getProducto().getNombre());
                    detDto.setProductoCodigoBarras(d.getProducto().getCodigoBarras());
                }
                detDto.setCantidad(d.getCantidad());
                detDto.setPrecioCosto(d.getPrecioCosto());
                detDto.setSubtotal(d.getSubtotal());
                detDto.setObservacion(d.getObservacion());
                return detDto;
            }).collect(Collectors.toList());
            dto.setDetalles(detallesDto);
        }
        return dto;
    }
}
