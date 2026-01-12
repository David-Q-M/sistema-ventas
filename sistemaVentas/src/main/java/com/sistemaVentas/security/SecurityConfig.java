package com.sistemaVentas.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

        @Autowired
        private JwtTokenFilter jwtTokenFilter;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http.csrf(csrf -> csrf.disable())
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**")
                                                .permitAll() // Permitir
                                                             // Preflight
                                                             // CORS
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/productos/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "ALMACENERO", "ROLE_ALMACENERO",
                                                                "CAJERO",
                                                                "ROLE_CAJERO")
                                                .requestMatchers("/api/productos/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "ALMACENERO", "ROLE_ALMACENERO")
                                                .requestMatchers("/api/ventas/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN", "CAJERO", "ROLE_CAJERO")
                                                .anyRequest().authenticated())
                                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
                org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();

                configuration.setAllowedOrigins(java.util.Arrays.asList(
                                "http://localhost:4200",
                                "https://sistemaventa-david.netlify.app"));
                configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(java.util.Arrays.asList("Authorization", "Content-Type",
                                "Access-Control-Allow-Origin"));
                configuration.setAllowCredentials(true);

                org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}