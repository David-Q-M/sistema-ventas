package com.sistemaVentas.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "catalogo_proveedores", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"proveedor_id", "producto_id"})
})
@Data
public class CatalogoProveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proveedor_id", nullable = false)
    @NotNull(message = "El proveedor es obligatorio")
    private Proveedor proveedor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto_id", nullable = false)
    @NotNull(message = "El producto es obligatorio")
    private Producto producto;

    @NotNull(message = "El precio de costo es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio de costo debe ser mayor a 0")
    @Column(name = "precio_costo", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioCosto;

    @NotNull(message = "El stock actual es obligatorio")
    @Min(value = 0, message = "El stock actual no puede ser negativo")
    @Column(name = "stock_actual", nullable = false)
    private Integer stockActual = 0;

    @Min(value = 0, message = "El stock mínimo no puede ser negativo")
    @Column(name = "stock_minimo")
    private Integer stockMinimo = 10;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Column(name = "codigo_lote", length = 50)
    private String codigoLote;

    @Column(name = "es_activo", nullable = false)
    private Boolean esActivo = true;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    @PreUpdate
    protected void onSaveOrUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}
