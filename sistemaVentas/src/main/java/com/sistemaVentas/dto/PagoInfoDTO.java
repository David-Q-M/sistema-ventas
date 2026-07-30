package com.sistemaVentas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagoInfoDTO {
    private String metodoPago;
    private BigDecimal montoEntregado;
    private String numeroReferencia;
}
