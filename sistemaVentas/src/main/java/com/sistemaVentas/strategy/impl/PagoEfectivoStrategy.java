package com.sistemaVentas.strategy.impl;

import org.springframework.stereotype.Component;
import com.sistemaVentas.dto.PagoInfoDTO;
import com.sistemaVentas.dto.ResultadoPagoDTO;
import com.sistemaVentas.strategy.MetodoPagoStrategy;

import java.math.BigDecimal;

@Component
public class PagoEfectivoStrategy implements MetodoPagoStrategy {

    @Override
    public String getTipoMetodo() {
        return "EFECTIVO";
    }

    @Override
    public ResultadoPagoDTO procesarPago(BigDecimal montoTotal, PagoInfoDTO pagoInfo) {
        BigDecimal montoEntregado = (pagoInfo != null && pagoInfo.getMontoEntregado() != null) 
                ? pagoInfo.getMontoEntregado() 
                : montoTotal;

        if (montoEntregado.compareTo(montoTotal) < 0) {
            throw new RuntimeException("Monto entregado insuficiente. Total venta: S/ " + 
                    montoTotal + ", Entregado: S/ " + montoEntregado);
        }

        BigDecimal cambio = montoEntregado.subtract(montoTotal);

        return new ResultadoPagoDTO(
                true,
                "EFECTIVO",
                montoTotal,
                montoEntregado,
                cambio,
                null,
                "Pago procesado en efectivo. Vuelto: S/ " + cambio
        );
    }
}
