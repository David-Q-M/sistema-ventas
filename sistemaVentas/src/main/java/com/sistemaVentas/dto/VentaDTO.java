package com.sistemaVentas.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class VentaDTO {
    private Long usuarioId;
    private String tipoComprobante; // TICKET, BOLETA, FACTURA
    private List<DetalleDTO> productos;

    // Campos de pago RF31
    private String metodoPago; // EFECTIVO, TARJETA, DIGITAL
    private BigDecimal montoEntregado;
    private String numeroReferencia;

    // Campos de descuento RF32
    private String tipoDescuento; // PORCENTAJE, MONTO
    private BigDecimal valorDescuento;

    // Datos del cliente opcionales
    private String clienteNombre;
    private String clienteDocumento;
    private String clienteDireccion;
}
