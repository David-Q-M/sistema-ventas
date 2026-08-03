package com.sistemaVentas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProveedorRequestDTO {

    @NotBlank(message = "El nombre o razón social es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @Pattern(regexp = "^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\\s\\.\\,\\-\\&\\/\\(\\)]+$", message = "El nombre o razón social contiene caracteres no válidos")
    private String nombre;

    @NotBlank(message = "El número de RUC es obligatorio")
    @Pattern(regexp = "^\\d{11}$", message = "El RUC solo debe contener números y tener exactamente 11 dígitos")
    private String ruc;

    @Size(max = 100, message = "El contacto no debe exceder 100 caracteres")
    @Pattern(regexp = "^$|^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\\s\\.\\,\\-\\&\\/\\(\\)]+$", message = "El nombre de contacto contiene caracteres no válidos")
    private String contacto;

    @Pattern(regexp = "^$|^\\d{7,9}$", message = "El teléfono debe contener solo números (entre 7 y 9 dígitos)")
    private String telefono;

    @Size(max = 255, message = "La dirección no debe exceder 255 caracteres")
    private String direccion;

    @Size(max = 50, message = "La categoría no debe exceder 50 caracteres")
    private String categoria;

    @Email(message = "Ingrese un correo electrónico válido")
    @Size(max = 100, message = "El correo no debe exceder 100 caracteres")
    private String email;

    private Boolean activo = true;

    private LocalDate ultimaOrden;

    private BigDecimal montoTotal;

    private Integer diasPago;
}
