package com.sistemaVentas.dto;

import lombok.Data;
import java.util.List;

@Data
public class VentaDTO {
    private Long usuarioId;
    private String tipoComprobante;
    private List<DetalleDTO> productos;
}
