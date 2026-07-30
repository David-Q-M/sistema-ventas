package com.sistemaVentas.strategy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class MetodoPagoFactory {

    private final Map<String, MetodoPagoStrategy> strategiesMap;

    @Autowired
    public MetodoPagoFactory(List<MetodoPagoStrategy> strategies) {
        this.strategiesMap = strategies.stream()
                .collect(Collectors.toMap(
                        s -> s.getTipoMetodo().toUpperCase(),
                        Function.identity()
                ));
    }

    public MetodoPagoStrategy getStrategy(String tipoMetodo) {
        if (tipoMetodo == null) {
            tipoMetodo = "EFECTIVO";
        }
        MetodoPagoStrategy strategy = strategiesMap.get(tipoMetodo.toUpperCase());
        if (strategy == null) {
            // Fallback por defecto a EFECTIVO
            strategy = strategiesMap.get("EFECTIVO");
        }
        if (strategy == null) {
            throw new RuntimeException("Estrategia de pago no encontrada para el método: " + tipoMetodo);
        }
        return strategy;
    }
}
