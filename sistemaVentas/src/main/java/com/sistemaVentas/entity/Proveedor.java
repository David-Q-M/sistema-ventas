package com.sistemaVentas.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "proveedores")
@Data
public class Proveedor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 20)
    private String ruc;

    @Column(length = 100)
    private String contacto;

    @Column(length = 20)
    private String telefono;

    @Column(length = 255)
    private String direccion;

    @Column(length = 50)
    private String categoria;

    @Column(length = 100)
    private String email;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "ultima_orden")
    private LocalDate ultimaOrden;

    @Column(name = "monto_total")
    private BigDecimal montoTotal = BigDecimal.ZERO;

    @Column(name = "dias_pago")
    private Integer diasPago = 0;
}
