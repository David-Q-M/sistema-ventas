package com.sistemaVentas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultadoPagoDTO {
    private boolean exito;
    private String metodoPago;
    private BigDecimal montoTotal;
    private BigDecimal montoEntregado;
    private BigDecimal montoCambio;
    private String numeroReferencia;
    private String mensaje;
}
