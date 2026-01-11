package com.sistemaVentas.dto;

import lombok.Data;
import java.util.List;

@Data
public class DetalleDTO {
    private Long productoId;
    private Integer cantidad;
}