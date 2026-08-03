package com.sistemaVentas.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sistemaVentas.dataaccess.CatalogoProveedorRepository;
import com.sistemaVentas.dataaccess.ProductoRepository;
import com.sistemaVentas.dataaccess.ProveedorRepository;
import com.sistemaVentas.dto.CatalogoProveedorRequestDTO;
import com.sistemaVentas.dto.CatalogoProveedorResponseDTO;
import com.sistemaVentas.entity.CatalogoProveedor;
import com.sistemaVentas.entity.Producto;
import com.sistemaVentas.entity.Proveedor;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CatalogoProveedorService {

    @Autowired
    private CatalogoProveedorRepository repository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Transactional(readOnly = true)
    public List<CatalogoProveedorResponseDTO> listarPorProveedor(Long proveedorId) {
        return repository.findByProveedorId(proveedorId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CatalogoProveedorResponseDTO> listarActivosPorProveedor(Long proveedorId) {
        return repository.findByProveedorIdAndEsActivoTrue(proveedorId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CatalogoProveedorResponseDTO obtenerPorId(Long id) {
        CatalogoProveedor cp = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro de catálogo no encontrado con ID: " + id));
        return mapToDTO(cp);
    }

    @Transactional
    public CatalogoProveedorResponseDTO guardarOCrear(CatalogoProveedorRequestDTO dto) {
        Proveedor proveedor = proveedorRepository.findById(dto.getProveedorId())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con ID: " + dto.getProveedorId()));

        Producto producto = productoRepository.findById(dto.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + dto.getProductoId()));

        // Permite asignar cualquier producto del sistema al catálogo del proveedor
        Optional<CatalogoProveedor> existente = repository.findByProveedorIdAndProductoId(dto.getProveedorId(), dto.getProductoId());

        CatalogoProveedor cp;
        if (existente.isPresent()) {
            cp = existente.get();
        } else {
            cp = new CatalogoProveedor();
            cp.setProveedor(proveedor);
            cp.setProducto(producto);
        }

        cp.setPrecioCosto(dto.getPrecioCosto());
        cp.setStockActual(dto.getStockActual() != null ? dto.getStockActual() : 0);
        cp.setStockMinimo(dto.getStockMinimo() != null ? dto.getStockMinimo() : 10);
        cp.setFechaVencimiento(dto.getFechaVencimiento());
        cp.setCodigoLote(dto.getCodigoLote());
        cp.setEsActivo(dto.getEsActivo() != null ? dto.getEsActivo() : true);

        CatalogoProveedor guardado = repository.save(cp);
        return mapToDTO(guardado);
    }

    @Transactional
    public CatalogoProveedorResponseDTO actualizar(Long id, CatalogoProveedorRequestDTO dto) {
        CatalogoProveedor cp = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro de catálogo no encontrado con ID: " + id));

        if (dto.getProductoId() != null && dto.getProductoId() > 0) {
            Producto producto = productoRepository.findById(dto.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + dto.getProductoId()));
            cp.setProducto(producto);
        }

        cp.setPrecioCosto(dto.getPrecioCosto());
        cp.setStockActual(dto.getStockActual());
        cp.setStockMinimo(dto.getStockMinimo());
        cp.setFechaVencimiento(dto.getFechaVencimiento());
        cp.setCodigoLote(dto.getCodigoLote());
        if (dto.getEsActivo() != null) {
            cp.setEsActivo(dto.getEsActivo());
        }

        CatalogoProveedor actualizado = repository.save(cp);
        return mapToDTO(actualizado);
    }

    @Transactional
    public CatalogoProveedorResponseDTO cambiarEstado(Long id, Boolean activo) {
        CatalogoProveedor cp = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro de catálogo no encontrado con ID: " + id));
        cp.setEsActivo(activo);
        CatalogoProveedor actualizado = repository.save(cp);
        return mapToDTO(actualizado);
    }

    @Transactional
    public void eliminar(Long id) {
        CatalogoProveedor cp = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro de catálogo no encontrado con ID: " + id));
        repository.delete(cp);
    }

    public CatalogoProveedorResponseDTO mapToDTO(CatalogoProveedor cp) {
        CatalogoProveedorResponseDTO dto = new CatalogoProveedorResponseDTO();
        dto.setId(cp.getId());
        if (cp.getProveedor() != null) {
            dto.setProveedorId(cp.getProveedor().getId());
            dto.setProveedorNombre(cp.getProveedor().getNombre());
        }
        if (cp.getProducto() != null) {
            dto.setProductoId(cp.getProducto().getId());
            dto.setProductoNombre(cp.getProducto().getNombre());
            dto.setProductoCodigoBarras(cp.getProducto().getCodigoBarras());
            if (cp.getProducto().getCategoria() != null) {
                dto.setProductoCategoriaNombre(cp.getProducto().getCategoria().getNombre());
            }
        }
        dto.setPrecioCosto(cp.getPrecioCosto());
        dto.setStockActual(cp.getStockActual());
        dto.setStockMinimo(cp.getStockMinimo());
        dto.setFechaVencimiento(cp.getFechaVencimiento());
        dto.setCodigoLote(cp.getCodigoLote());
        dto.setEsActivo(cp.getEsActivo());
        dto.setFechaActualizacion(cp.getFechaActualizacion());
        return dto;
    }
}
