package com.sistemaVentas.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Entity
@Table(name = "productos")
@Data
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre no puede estar en blanco")
    @Size(min = 2, max = 100, message = "Entre 2 y 100 caracteres")
    private String nombre;

    @PositiveOrZero(message = "El stock debe ser positivo o cero")
    private int stock;

    @Digits(integer = 8, fraction = 2, message = "Formato de precio inválido (8 enteros, 2 decimales)")
    @DecimalMin(value = "0.01", message = "El precio mínimo es 0.01")
    private java.math.BigDecimal precioVenta;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "proveedor_id")
    private Proveedor proveedor;

    @Column(unique = true, name = "codigo_barras")
    private String codigoBarras;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fecha_creacion", updatable = false)
    private java.time.LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = java.time.LocalDateTime.now();
    }

    // @org.hibernate.validator.constraints.URL(message = "La URL de la imagen no es
    // válida")
    @Column(name = "url_imagen", columnDefinition = "TEXT")
    private String urlImagen;
}