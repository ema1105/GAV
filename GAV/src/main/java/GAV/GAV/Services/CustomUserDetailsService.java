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

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users user = usersRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con username: " + username));

        // Convertir el rol de tu entidad Users a un GrantedAuthority que Spring Security reconozca
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRol().name());

        // Retornar el usuario compatible con Spring Security
        return new User(
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(authority)
        );
    }
}