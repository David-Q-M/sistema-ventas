package com.sistemaVentas.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimiento_inventarios", indexes = {
    @Index(name = "idx_mov_fecha", columnList = "fecha"),
    @Index(name = "idx_mov_producto", columnList = "producto_id"),
    @Index(name = "idx_mov_tipo", columnList = "tipo_movimiento")
})
@Data
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(name = "tipo_movimiento", nullable = false, length = 20)
    private String tipoMovimiento; // ENTRADA, SALIDA, AJUSTE

    @Column(nullable = false)
    private int cantidad;

    @Column(name = "stock_anterior", nullable = false)
    private int stockAnterior;

    @Column(name = "stock_final", nullable = false)
    private int stockFinal;

    @Column(length = 100)
    private String usuario;

    @Column(columnDefinition = "TEXT")
    private String motivo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha;

    @PrePersist
    protected void onCreate() {
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
    }
}
