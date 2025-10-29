package GAV.GAV.Controllers;
import GAV.GAV.Collections.Users;
import GAV.GAV.Services.ClientServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Permite peticiones desde Flutter
public class LoginController {
    @Autowired
    private ClientServices clientService;

    /**
     * 🔹 Login: Flutter envía username y password
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String username = credentials.get("username");
            String password = credentials.get("password");

            Users user = clientService.login(username, password);

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
            }

            // Puedes generar token JWT aquí si lo implementas más adelante
            return ResponseEntity.ok(Map.of(
                    "message", "Inicio de sesión exitoso",
                    "userId", user.getId(),
                    "fullname", user.getFullname(),
                    "role", user.getRol().toString()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    //Registro de cliente

    @PostMapping("/register")
    public ResponseEntity<?> registerClient(@RequestBody Users client) {
        try {
            if (clientService.usernameExists(client.getUsername())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Nombre de usuario en uso"));
            }
            if (clientService.emailExists(client.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Correo electrónico en uso"));
            }
            if (clientService.documentExists(client.getDocumentNumber())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Documento ya registrado"));
            }
            if (clientService.phoneExists(client.getNumber())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Teléfono ya registrado"));
            }

            clientService.registerClient(client);
            return ResponseEntity.ok(Map.of("message", "Registro exitoso"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
