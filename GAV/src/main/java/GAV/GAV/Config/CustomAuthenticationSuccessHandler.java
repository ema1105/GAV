package GAV.GAV.Config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        // Redirige según el rol del usuario
        var authorities = authentication.getAuthorities();

        String redirectURL = request.getContextPath();

        if (authorities.stream().anyMatch(a -> a.getAuthority().equals("ADMINISTRATOR"))) {
            redirectURL += "/admin/inicio";
        } else if (authorities.stream().anyMatch(a -> a.getAuthority().equals("DRIVER"))) {
            redirectURL += "/conductor/inicio";
        } else if (authorities.stream().anyMatch(a -> a.getAuthority().equals("CLIENT"))) {
            redirectURL += "/cliente/inicio";
        } else {
            redirectURL += "/login?error";
        }

        response.sendRedirect(redirectURL);
    }
}
