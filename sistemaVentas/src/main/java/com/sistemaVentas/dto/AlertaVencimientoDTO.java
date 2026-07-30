package com.sistemaVentas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertaVencimientoDTO {
    private Long productoId;
    private String productoNombre;
    private String codigoBarras;
    private String categoriaNombre;
    private int stock;
    private int stockMinimo;
    private LocalDate fechaVencimiento;
    private long diasRestantes;
    private String estadoAlerta; // "CRITICO", "PRECAUCION", "NORMAL"
    private boolean perecible;
}
