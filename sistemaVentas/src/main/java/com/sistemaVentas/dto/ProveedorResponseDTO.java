package com.sistemaVentas.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProveedorResponseDTO {

    private Long id;
    private String nombre;
    private String ruc;
    private String contacto;
    private String telefono;
    private String direccion;
    private String categoria;
    private String email;
    private Boolean activo;
    private LocalDate ultimaOrden;
    private BigDecimal montoTotal;
    private Integer diasPago;
}
