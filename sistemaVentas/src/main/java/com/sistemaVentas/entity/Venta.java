package com.sistemaVentas.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ventas")
@Data
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Venta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "La fecha no puede ser nula")
    @PastOrPresent(message = "La fecha debe ser pasada o presente")
    private LocalDateTime fechaVenta = LocalDateTime.now();

    @PositiveOrZero(message = "El total debe ser positivo o cero")
    @Digits(integer = 8, fraction = 2, message = "Formato de total inválido")
    private BigDecimal total;

    @NotBlank(message = "El tipo de comprobante no puede estar en blanco")
    @Pattern(regexp = "TICKET|BOLETA|FACTURA", message = "Tipo de comprobante inválido")
    private String tipoComprobante;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    // Relación para el CRUD completo: permite ver los productos de la venta
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<DetalleVenta> detalles;
}