package com.sistemaVentas.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtTokenFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtUtil.validateToken(token)) {
                String username = jwtUtil.getUsernameFromToken(token);
                String role = jwtUtil.getRoleFromToken(token);

                List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
                if (role != null && !role.isBlank()) {
                    String cleanRole = role.trim().toUpperCase();
                    authorities.add(new SimpleGrantedAuthority(cleanRole));
                    if (!cleanRole.startsWith("ROLE_")) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + cleanRole));
                    } else {
                        authorities.add(new SimpleGrantedAuthority(cleanRole.substring(5)));
                    }
                }

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(username, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                System.out.println("Invalid Token");
            }
        } else {
            System.out.println("No Auth Header or not Bearer: " + header);
        }
        filterChain.doFilter(request, response);
    }
}