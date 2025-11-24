package GAV.GAV.Services;
import GAV.GAV.Collections.Users;
import GAV.GAV.Repositories.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsersRepository usersRepository;

    public CustomUserDetailsService(UsersRepository usersRepository){
        this.usersRepository = usersRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try {
            Users user = usersRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con username: " + username));

            // Validar que el usuario tenga un rol válido
            if (user.getRol() == null) {
                throw new UsernameNotFoundException("Usuario sin rol asignado: " + username);
            }

            // Validar que el usuario tenga username y password
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                throw new UsernameNotFoundException("Usuario sin username válido: " + username);
            }

            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                throw new UsernameNotFoundException("Usuario sin contraseña: " + username);
            }

            GrantedAuthority authority = new SimpleGrantedAuthority(user.getRol().name());

            return new User(
                    user.getUsername(),
                    user.getPassword(),
                    Collections.singletonList(authority)
            );
        } catch (UsernameNotFoundException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al cargar usuario: " + username + " - " + e.getMessage());
            e.printStackTrace();
            throw new UsernameNotFoundException("Error al cargar usuario: " + e.getMessage(), e);
        }
    }
}