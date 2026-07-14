package com.sistemaVentas.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_compras")
@Data
public class DetalleCompra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compra_id", nullable = false)
    @JsonIgnore
    private Compra compra;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "precio_costo", nullable = false)
    private BigDecimal precioCosto;

    @Column(nullable = false)
    private BigDecimal subtotal;

    @Column(name = "observacion_item", length = 255)
    private String observacion;
}
