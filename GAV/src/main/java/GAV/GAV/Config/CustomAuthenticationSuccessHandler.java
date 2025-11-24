package GAV.GAV.Config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        try {
            System.out.println("=== INICIO DE AUTENTICACIÓN EXITOSA ===");
            System.out.println("Usuario autenticado: " + (authentication != null ? authentication.getName() : "null"));
            
            final String defaultRedirectUrl = "/login";
            String redirectUrl = determineRedirectUrl(authentication, defaultRedirectUrl);
            
            System.out.println("URL de redirección determinada: " + redirectUrl);
            
            // Asegurar que la respuesta esté limpia antes de redirigir
            if (response.isCommitted()) {
                System.err.println("ERROR: La respuesta ya está comprometida, no se puede redirigir");
                return;
            }
            
            // Limpiar cualquier header previo
            response.reset();
            response.setStatus(HttpServletResponse.SC_OK);
            
            System.out.println("Redirigiendo a: " + redirectUrl);
            response.sendRedirect(redirectUrl);
            System.out.println("=== FIN DE AUTENTICACIÓN EXITOSA ===");
            
        } catch (Exception e) {
            System.err.println("ERROR en onAuthenticationSuccess: " + e.getMessage());
            e.printStackTrace();
            
            // Si hay algún error en la redirección, redirigir al login con error
            try {
                if (!response.isCommitted()) {
                    response.sendRedirect("/login?error=true");
                }
            } catch (IOException ioException) {
                System.err.println("ERROR crítico al redirigir al login: " + ioException.getMessage());
                ioException.printStackTrace();
            }
        }
    }

    private String determineRedirectUrl(Authentication authentication, String defaultUrl) {
        if (authentication == null) {
            System.err.println("ERROR: Authentication es null");
            return defaultUrl;
        }
        
        if (authentication.getAuthorities() == null) {
            System.err.println("ERROR: Authorities es null para usuario: " + authentication.getName());
            return defaultUrl;
        }
        
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        System.out.println("Número de autoridades: " + authorities.size());

        for (GrantedAuthority auth : authorities) {
            if (auth == null) {
                System.err.println("ADVERTENCIA: Authority null encontrado");
                continue;
            }
            
            if (auth.getAuthority() == null) {
                System.err.println("ADVERTENCIA: Authority.getAuthority() es null");
                continue;
            }
            
            String authority = auth.getAuthority();
            System.out.println("Procesando autoridad: " + authority);
            
            switch (authority) {
                case "ADMINISTRATOR":
                    System.out.println("Redirigiendo a ADMINISTRATOR");
                    return "/admin/inicio";
                case "DRIVER":
                    System.out.println("Redirigiendo a DRIVER");
                    return "/conductor/inicio";
                case "CLIENT":
                    System.out.println("Redirigiendo a CLIENT");
                    return "/cliente/inicio";
                default:
                    System.err.println("ADVERTENCIA: Autoridad desconocida: " + authority);
            }
        }
        
        System.err.println("ERROR: No se encontró una autoridad válida, usando URL por defecto");
        return defaultUrl;
    }
}