package com.sistemaVentas.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sistemaVentas.dataaccess.RolRepository;
import com.sistemaVentas.dataaccess.UsuarioRepository;
import com.sistemaVentas.dto.UsuarioDTO;
import com.sistemaVentas.entity.Rol;
import com.sistemaVentas.entity.Usuario;

import java.util.List;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepo;
    @Autowired
    private RolRepository rolRepo;

    public List<Usuario> listar() {
        return usuarioRepo.findAll();
    }

    public Usuario guardar(UsuarioDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setNombreCompleto(dto.getNombreCompleto());
        usuario.setUsername(dto.getUsername());
        usuario.setPassword(dto.getPassword()); // En prod usar BCrypt
        usuario.setActivo(true);

        Rol rol = rolRepo.findByNombre(dto.getRolNombre())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + dto.getRolNombre()));
        usuario.setRol(rol);

        return usuarioRepo.save(usuario);
    }

    public Usuario obtenerPorId(Integer id) {
        return usuarioRepo.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public Usuario actualizar(Integer id, UsuarioDTO dto) {
        Usuario usuario = obtenerPorId(id);
        usuario.setNombreCompleto(dto.getNombreCompleto());
        usuario.setUsername(dto.getUsername());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            usuario.setPassword(dto.getPassword());
        }

        Rol rol = rolRepo.findByNombre(dto.getRolNombre())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        usuario.setRol(rol);

        return usuarioRepo.save(usuario);
    }

    public void eliminar(Integer id) {
        usuarioRepo.deleteById(id);
    }
}
