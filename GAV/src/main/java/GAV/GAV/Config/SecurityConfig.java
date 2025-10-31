package GAV.GAV.Config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

@Configuration
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 1800)
public class SecurityConfig {


    private final CustomAuthenticationSuccessHandler successHandler;

    public SecurityConfig(CustomAuthenticationSuccessHandler successHandler) {
        this.successHandler = successHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authz -> authz
                // Páginas públicas
                .requestMatchers("/", "/home", "/index", "/login", "/register").permitAll()
                .requestMatchers("/css/**", "/js/**", "/img/**").permitAll()

                // Secciones protegidas por rol
                .requestMatchers("/admin/**").hasAuthority("ADMINISTRATOR")
                .requestMatchers("/cliente/**").hasAuthority("CLIENT")
                .requestMatchers("/conductor/**").hasAuthority("DRIVER")

                // Cualquier otra ruta, protegida
                .anyRequest().authenticated()
        )
                // Login form clásico (manejado por Spring Security)
                .formLogin(form -> form
                        .loginPage("/login")               // Vista del login (login.html)
                        .loginProcessingUrl("/login")      // Acción del formulario
                        .successHandler(successHandler)    // Redirección según rol
                        .permitAll()
                )
                // Configuración de logout
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login?logout=true")
                        .permitAll()
                )
                .csrf(csrf -> csrf.disable()); // Puedes habilitarlo luego si usas formularios protegidos

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


}

