package com.sistemaVentas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CompraRequestDTO {

    @NotNull(message = "El proveedor es obligatorio")
    private Long proveedorId;

    private LocalDate fechaPedido;

    private LocalDate fechaEntrega;

    @Size(max = 50, message = "El método de pedido no debe exceder 50 caracteres")
    private String metodoPedido;

    @Size(max = 50, message = "El estado de pago no debe exceder 50 caracteres")
    private String estadoPago;

    @Size(max = 20, message = "El estado no debe exceder 20 caracteres")
    private String estado = "PENDIENTE";

    private String observacion;

    @NotEmpty(message = "La orden de compra debe contener al menos un producto en el detalle")
    @Valid
    private List<DetalleCompraRequestDTO> detalles;

    @jakarta.validation.constraints.AssertTrue(message = "La fecha de entrega debe ser igual o posterior a la fecha del pedido")
    public boolean isFechaEntregaValida() {
        if (fechaPedido == null || fechaEntrega == null) {
            return true;
        }
        return !fechaEntrega.isBefore(fechaPedido);
    }
}
