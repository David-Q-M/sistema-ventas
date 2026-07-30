package com.sistemaVentas.strategy;

import com.sistemaVentas.dto.PagoInfoDTO;
import com.sistemaVentas.dto.ResultadoPagoDTO;

import java.math.BigDecimal;

public interface MetodoPagoStrategy {
    String getTipoMetodo(); // "EFECTIVO", "TARJETA", "DIGITAL"
    ResultadoPagoDTO procesarPago(BigDecimal montoTotal, PagoInfoDTO pagoInfo);
}
