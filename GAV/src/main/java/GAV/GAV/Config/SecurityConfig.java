
package GAV.GAV.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

@Configuration
@EnableRedisHttpSession
public class SecurityConfig {


    private final CustomAuthenticationSuccessHandler successHandler;

    public SecurityConfig(CustomAuthenticationSuccessHandler successHandler) {
        this.successHandler = successHandler;
    }
    
    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/", "/home", "/index", "/login", "/register", "/homepage").permitAll()
                        .requestMatchers("/css/**", "/js/**", "/img/**", "/static/**", "/webjars/**", "/mapbox/**").permitAll()
                        //prediccion
                        .requestMatchers(HttpMethod.GET, "/api/prediccion/**").hasAuthority("ADMINISTRATOR")

                        //CLIENTE
                        .requestMatchers(HttpMethod.GET, "/api/client/**").hasAuthority("CLIENT")
                        .requestMatchers(HttpMethod.POST, "/api/travels/create").hasAuthority("CLIENT")
                        .requestMatchers(HttpMethod.GET, "/api/client/destinations").hasAuthority("CLIENT")
                        .requestMatchers(HttpMethod.GET, "/api/client/profile").hasAuthority("CLIENT")
                        .requestMatchers(HttpMethod.POST, "/api/client/travels/request").hasAuthority("CLIENT")
                        .requestMatchers(HttpMethod.POST, "/api/client/travels/rate").hasAuthority("CLIENT")
                        .requestMatchers(HttpMethod.GET, "/api/client/travels/*/rating").hasAuthority("CLIENT")
                        .requestMatchers(HttpMethod.PUT, "/api/client/profile").hasAuthority("CLIENT")
                        .requestMatchers(HttpMethod.GET, "/api/client/travels/history").hasAuthority("CLIENT")
                        .requestMatchers(HttpMethod.GET, "/api/client/travels/history").hasAuthority("CLIENT")

                        //CONDUCTOR
                        .requestMatchers(HttpMethod.GET, "/api/driver/**").hasAuthority("DRIVER")
                        .requestMatchers("/api/travels/").authenticated()
                        .requestMatchers("/api/driver/**").hasAuthority("DRIVER")
                        .requestMatchers(HttpMethod.GET, "/api/driver/profile").hasAuthority("DRIVER")
                        .requestMatchers(HttpMethod.POST, "/api/driver/profile/update").hasAuthority("DRIVER")
                        .requestMatchers(HttpMethod.GET, "/api/driver/travels/active").hasAuthority("DRIVER")
                        .requestMatchers(HttpMethod.GET, "/api/driver/travels/requests").hasAuthority("DRIVER")
                        .requestMatchers(HttpMethod.GET, "/api/driver/travels/history").hasAuthority("DRIVER")
                        .requestMatchers(HttpMethod.POST, "/api/driver/travels/*/accept").hasAuthority("DRIVER")
                        .requestMatchers(HttpMethod.POST, "/api/driver/travels/*/reject").hasAuthority("DRIVER")
                        .requestMatchers(HttpMethod.POST, "/api/driver/travels/*/start").hasAuthority("DRIVER")
                        .requestMatchers(HttpMethod.POST, "/api/driver/travels/*/finish").hasAuthority("DRIVER")
                        .requestMatchers(HttpMethod.GET, "/api/driver/by-username/*").hasAuthority("DRIVER")


                        //GENERALES PARA LAS VISTAS
                        .requestMatchers("/admin/**").hasAuthority("ADMINISTRATOR")
                        .requestMatchers("/cliente/**").hasAuthority("CLIENT")
                        .requestMatchers("/conductor/**").hasAuthority("DRIVER")
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/login")
                        .loginProcessingUrl("/login")
                        .successHandler(successHandler)
                        .failureUrl("/login?error=true")
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/homepage")
                        .invalidateHttpSession(true)
                        .permitAll()
                )
                .sessionManagement(session -> session
                        .sessionFixation().migrateSession()
                        .maximumSessions(1)
                        .maxSessionsPreventsLogin(false)
                        .expiredUrl("/login?expired")
                        .sessionRegistry(sessionRegistry())
                )
                .csrf(csrf -> csrf.disable());

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

