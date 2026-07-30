package com.sistemaVentas.strategy.impl;

import org.springframework.stereotype.Component;
import com.sistemaVentas.dto.PagoInfoDTO;
import com.sistemaVentas.dto.ResultadoPagoDTO;
import com.sistemaVentas.strategy.MetodoPagoStrategy;

import java.math.BigDecimal;

@Component
public class PagoDigitalStrategy implements MetodoPagoStrategy {

    @Override
    public String getTipoMetodo() {
        return "DIGITAL";
    }

    @Override
    public ResultadoPagoDTO procesarPago(BigDecimal montoTotal, PagoInfoDTO pagoInfo) {
        String numOp = (pagoInfo != null) ? pagoInfo.getNumeroReferencia() : null;
        if (numOp == null || numOp.trim().isEmpty()) {
            throw new RuntimeException("El número de operación digital (Yape / Plin / QR) es obligatorio");
        }

        return new ResultadoPagoDTO(
                true,
                "DIGITAL",
                montoTotal,
                montoTotal,
                BigDecimal.ZERO,
                numOp.trim(),
                "Pago digital Yape/Plin/QR verificado. N° Operación: " + numOp.trim()
        );
    }
}
