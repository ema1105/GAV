package GAV.GAV.Services;
import GAV.GAV.Collections.Users;
import GAV.GAV.Repositories.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
public class UsersService {
    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // -------------------- REGISTRO --------------------

    public Users registerUser(Users user) {
        // Validaciones de duplicados
        if (usersRepository.existsByUsername(user.getUsername()))
            throw new RuntimeException("El nombre de usuario ya está en uso.");

        if (usersRepository.existsByEmail(user.getEmail()))
            throw new RuntimeException("El correo electrónico ya está registrado.");

        if (usersRepository.existsByDocumentNumber(user.getDocumentNumber()))
            throw new RuntimeException("El número de documento ya está registrado.");

        if (usersRepository.existsByNumber(user.getNumber()))
            throw new RuntimeException("El número de teléfono ya está registrado.");

        // Si el rol no se define, por defecto será CLIENTE
        if (user.getRol() == null)
            user.setRol(Users.Roles.CLIENT);

        // Encriptar la contraseña
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Los conductores se crean disponibles, los demás no aplican este campo
        if (user.getRol() == Users.Roles.DRIVER) {
            user.setAvailability(true);
        }

        return usersRepository.save(user);
    }

    // -------------------- OBTENCIÓN --------------------

    public List<Users> getAllUsers() {
        return usersRepository.findAll();
    }

    public Optional<Users> getUserById(String id) {
        return usersRepository.findById(id);
    }

    public Optional<Users> getUserByUsername(String username) {
        return usersRepository.findByUsername(username);
    }

    public List<Users> getUsersByRole(Users.Roles role) {
        return usersRepository.findByRol(role);
    }

    // -------------------- ACTUALIZACIÓN --------------------

    public Users updateUser(Users updatedUser) {
        if (updatedUser.getId() == null)
            throw new RuntimeException("El ID del usuario es obligatorio.");

        Users existing = usersRepository.findById(updatedUser.getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        // Validaciones de duplicados en otros campos
        usersRepository.findByUsername(updatedUser.getUsername())
                .filter(u -> !u.getId().equals(updatedUser.getId()))
                .ifPresent(u -> { throw new RuntimeException("El nombre de usuario ya está en uso."); });

        usersRepository.findByEmail(updatedUser.getEmail())
                .filter(u -> !u.getId().equals(updatedUser.getId()))
                .ifPresent(u -> { throw new RuntimeException("El correo electrónico ya está registrado."); });

        usersRepository.findByDocumentNumber(updatedUser.getDocumentNumber())
                .filter(u -> !u.getId().equals(updatedUser.getId()))
                .ifPresent(u -> { throw new RuntimeException("El número de documento ya está registrado."); });

        usersRepository.findByNumber(updatedUser.getNumber())
                .filter(u -> !u.getId().equals(updatedUser.getId()))
                .ifPresent(u -> { throw new RuntimeException("El teléfono ya está registrado."); });

        // Mantener contraseña actual si no se envía una nueva
        if (updatedUser.getPassword() == null || updatedUser.getPassword().isEmpty()) {
            updatedUser.setPassword(existing.getPassword());
        } else {
            updatedUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        // Mantener el rol original si no se cambia explícitamente
        if (updatedUser.getRol() == null) {
            updatedUser.setRol(existing.getRol());
        }

        // Actualizar disponibilidad solo si es conductor
        if (updatedUser.getRol() == Users.Roles.DRIVER && updatedUser.getAvailability() == null) {
            updatedUser.setAvailability(existing.getAvailability());
        }

        return usersRepository.save(updatedUser);
    }

    // -------------------- ELIMINACIÓN --------------------

    public void deleteUser(String id) {
        if (!usersRepository.existsById(id))
            throw new RuntimeException("Usuario no encontrado.");
        usersRepository.deleteById(id);
    }

    // -------------------- DISPONIBILIDAD CONDUCTORES --------------------

    public void updateDriverAvailability(String driverId, boolean available) {
        Users driver = usersRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Conductor no encontrado."));

        if (driver.getRol() != Users.Roles.DRIVER)
            throw new RuntimeException("El usuario no es un conductor.");

        driver.setAvailability(available);
        usersRepository.save(driver);
    }
    //----------------------CREACION DEL USUARIO ADMIN POR DEFECTO---------------

    public void createDefaultAdmin() {
        String defaultAdminEmail = "admin@gav.com";

        // Verificar si ya existe un usuario administrador
        Optional<Users> existingAdmin = usersRepository.findByEmail(defaultAdminEmail);
        if (existingAdmin.isPresent()) {
            System.out.println("Usuario administrador ya existe: " + defaultAdminEmail);
            return;
        }

        Users admin = new Users();
        admin.setUsername("admin");
        admin.setFullname("Administrador");
        admin.setLastname("GAV");
        admin.setEmail(defaultAdminEmail);
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRol(Users.Roles.ADMINISTRATOR);
        admin.setNumber("0000000000");
        admin.setDocumentNumber("00000000");
        admin.setAvailability(false);

        usersRepository.save(admin);
        System.out.println("Usuario administrador creado automáticamente: " + defaultAdminEmail + " / admin123");
    }

}
