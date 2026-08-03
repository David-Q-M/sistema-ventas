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
                                .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) -> {
                                        response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                                        response.setContentType("application/json;charset=UTF-8");
                                        response.getWriter().write("{\"error\": \"No autorizado\", \"message\": \"Token no válido o expirado\"}");
                                }))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                                                .requestMatchers("/api/auth/**").permitAll()
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
                configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                configuration.setAllowedHeaders(java.util.Arrays.asList("*"));
                configuration.setAllowCredentials(true);

                org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        @Bean
        public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
                return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        }
}