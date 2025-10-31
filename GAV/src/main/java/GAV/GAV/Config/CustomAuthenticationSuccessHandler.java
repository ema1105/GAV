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
                                        Authentication authentication)
            throws IOException, ServletException {

        String targetUrl = determineTargetUrl(authentication.getAuthorities());
        response.sendRedirect(targetUrl);
    }

    private String determineTargetUrl(Collection<? extends GrantedAuthority> authorities) {
        for (GrantedAuthority auth : authorities) {
            switch (auth.getAuthority()) {
                case "ADMINISTRATOR":
                    return "/admin/inicio";
                case "DRIVER":
                    return "/conductor/inicio";
                case "CLIENT":
                    return "/cliente/inicio";
            }
        }
        return "/"; // Si no se reconoce el rol
    }
}



