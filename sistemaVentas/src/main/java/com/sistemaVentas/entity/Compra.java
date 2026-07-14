package com.sistemaVentas.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "compras")
@Data
public class Compra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proveedor_id", nullable = false)
    private Proveedor proveedor;

    @Column(name = "fecha_pedido", nullable = false)
    private LocalDate fechaPedido;

    @Column(name = "fecha_entrega")
    private LocalDate fechaEntrega;

    @Column(name = "metodo_pedido", length = 50)
    private String metodoPedido;

    @Column(name = "estado_pago", length = 50)
    private String estadoPago;

    @Column(name = "monto_total", nullable = false)
    private BigDecimal montoTotal = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String estado = "PENDIENTE"; // PENDIENTE, RECIBIDO, CANCELADO

    @Column(columnDefinition = "TEXT")
    private String observacion;

    @OneToMany(mappedBy = "compra", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleCompra> detalles;
}
