package com.sistemaVentas.strategy.impl;

import org.springframework.stereotype.Component;
import com.sistemaVentas.dto.PagoInfoDTO;
import com.sistemaVentas.dto.ResultadoPagoDTO;
import com.sistemaVentas.strategy.MetodoPagoStrategy;

import java.math.BigDecimal;

@Component
public class PagoTarjetaStrategy implements MetodoPagoStrategy {

    @Override
    public String getTipoMetodo() {
        return "TARJETA";
    }

    @Override
    public ResultadoPagoDTO procesarPago(BigDecimal montoTotal, PagoInfoDTO pagoInfo) {
        String numRef = (pagoInfo != null) ? pagoInfo.getNumeroReferencia() : null;
        if (numRef == null || numRef.trim().isEmpty()) {
            throw new RuntimeException("El número de referencia o código de voucher de la tarjeta es obligatorio");
        }

        return new ResultadoPagoDTO(
                true,
                "TARJETA",
                montoTotal,
                montoTotal,
                BigDecimal.ZERO,
                numRef.trim(),
                "Pago con tarjeta aprobado. Ref: " + numRef.trim()
        );
    }
}
