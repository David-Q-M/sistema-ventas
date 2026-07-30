package com.sistemaVentas.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sistemaVentas.dataaccess.ProveedorRepository;
import com.sistemaVentas.dto.ProveedorRequestDTO;
import com.sistemaVentas.dto.ProveedorResponseDTO;
import com.sistemaVentas.entity.Proveedor;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProveedorService {

    @Autowired
    private ProveedorRepository repo;

    @Transactional(readOnly = true)
    public List<ProveedorResponseDTO> listar() {
        return repo.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProveedorResponseDTO> listarActivos() {
        return repo.findByActivoTrue().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProveedorResponseDTO obtenerPorIdDTO(Long id) {
        Proveedor p = obtenerPorIdEntity(id);
        return mapToResponseDTO(p);
    }

    @Transactional(readOnly = true)
    public Proveedor obtenerPorIdEntity(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con ID: " + id));
    }

    @Transactional
    public ProveedorResponseDTO guardarDTO(ProveedorRequestDTO dto) {
        // Validation: Unique RUC
        if (dto.getRuc() != null && !dto.getRuc().trim().isEmpty()) {
            String rucClean = dto.getRuc().trim();
            if (repo.existsByRuc(rucClean)) {
                throw new RuntimeException("El RUC " + rucClean + " ya se encuentra registrado.");
            }
        }

        Proveedor p = new Proveedor();
        mapDTOToEntity(dto, p);
        if (p.getActivo() == null) {
            p.setActivo(true);
        }
        if (p.getMontoTotal() == null) {
            p.setMontoTotal(BigDecimal.ZERO);
        }
        if (p.getDiasPago() == null) {
            p.setDiasPago(0);
        }

        Proveedor guardado = repo.save(p);
        return mapToResponseDTO(guardado);
    }

    @Transactional
    public ProveedorResponseDTO actualizarDTO(Long id, ProveedorRequestDTO dto) {
        Proveedor p = obtenerPorIdEntity(id);

        // Validation: Unique RUC excluding current supplier
        if (dto.getRuc() != null && !dto.getRuc().trim().isEmpty()) {
            String rucClean = dto.getRuc().trim();
            if (repo.existsByRucAndIdNot(rucClean, id)) {
                throw new RuntimeException("El RUC " + rucClean + " pertenece a otro proveedor registrado.");
            }
        }

        mapDTOToEntity(dto, p);
        Proveedor actualizado = repo.save(p);
        return mapToResponseDTO(actualizado);
    }

    /**
     * RF24: Eliminación Lógica (Soft Delete)
     * Desactiva el proveedor estableciendo activo = false,
     * conservando la integridad referencial para el Módulo 2 (Compras).
     */
    @Transactional
    public ProveedorResponseDTO desactivar(Long id) {
        Proveedor p = obtenerPorIdEntity(id);
        p.setActivo(false);
        Proveedor deshabilitado = repo.save(p);
        return mapToResponseDTO(deshabilitado);
    }

    @Transactional
    public ProveedorResponseDTO cambiarEstado(Long id, Boolean activo) {
        Proveedor p = obtenerPorIdEntity(id);
        p.setActivo(activo);
        Proveedor actualizado = repo.save(p);
        return mapToResponseDTO(actualizado);
    }

    // --- Legacy compatibility methods ---
    @Transactional(readOnly = true)
    public Proveedor obtenerPorId(Long id) {
        return obtenerPorIdEntity(id);
    }

    @Transactional
    public Proveedor guardar(Proveedor p) {
        if (p.getRuc() != null && !p.getRuc().trim().isEmpty()) {
            if (repo.existsByRuc(p.getRuc().trim())) {
                throw new RuntimeException("El RUC " + p.getRuc() + " ya se encuentra registrado.");
            }
        }
        return repo.save(p);
    }

    @Transactional
    public Proveedor actualizar(Long id, Proveedor detalles) {
        Proveedor p = obtenerPorIdEntity(id);
        if (detalles.getRuc() != null && !detalles.getRuc().trim().isEmpty()) {
            if (repo.existsByRucAndIdNot(detalles.getRuc().trim(), id)) {
                throw new RuntimeException("El RUC " + detalles.getRuc() + " pertenece a otro proveedor.");
            }
        }
        p.setNombre(detalles.getNombre());
        p.setRuc(detalles.getRuc());
        p.setContacto(detalles.getContacto());
        p.setTelefono(detalles.getTelefono());
        p.setDireccion(detalles.getDireccion());
        p.setCategoria(detalles.getCategoria());
        p.setEmail(detalles.getEmail());
        if (detalles.getActivo() != null) {
            p.setActivo(detalles.getActivo());
        }
        return repo.save(p);
    }

    @Transactional
    public void eliminar(Long id) {
        desactivar(id);
    }

    // Helper mapping methods
    private ProveedorResponseDTO mapToResponseDTO(Proveedor entity) {
        ProveedorResponseDTO dto = new ProveedorResponseDTO();
        dto.setId(entity.getId());
        dto.setNombre(entity.getNombre());
        dto.setRuc(entity.getRuc());
        dto.setContacto(entity.getContacto());
        dto.setTelefono(entity.getTelefono());
        dto.setDireccion(entity.getDireccion());
        dto.setCategoria(entity.getCategoria());
        dto.setEmail(entity.getEmail());
        dto.setActivo(entity.getActivo());
        dto.setUltimaOrden(entity.getUltimaOrden());
        dto.setMontoTotal(entity.getMontoTotal());
        dto.setDiasPago(entity.getDiasPago());
        return dto;
    }

    private void mapDTOToEntity(ProveedorRequestDTO dto, Proveedor entity) {
        entity.setNombre(dto.getNombre());
        entity.setRuc(dto.getRuc());
        entity.setContacto(dto.getContacto());
        entity.setTelefono(dto.getTelefono());
        entity.setDireccion(dto.getDireccion());
        entity.setCategoria(dto.getCategoria());
        entity.setEmail(dto.getEmail());
        if (dto.getActivo() != null) {
            entity.setActivo(dto.getActivo());
        }
        if (dto.getUltimaOrden() != null) {
            entity.setUltimaOrden(dto.getUltimaOrden());
        }
        if (dto.getMontoTotal() != null) {
            entity.setMontoTotal(dto.getMontoTotal());
        }
        if (dto.getDiasPago() != null) {
            entity.setDiasPago(dto.getDiasPago());
        }
    }
}
