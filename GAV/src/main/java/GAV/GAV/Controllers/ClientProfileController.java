package GAV.GAV.Controllers;


import GAV.GAV.DTO.ClientProfileDTO;
import GAV.GAV.Services.ClientServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/client/profile")
public class ClientProfileController {
    @Autowired
    private ClientServices clientService;

    // Obtener perfil del cliente logueado
    @GetMapping
    public ResponseEntity<?> getProfile(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no autenticado"));
            }

            var profile = clientService.getProfile(principal.getName());
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Actualizar perfil
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody ClientProfileDTO dto, Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no autenticado"));
            }

            clientService.updateProfile(principal.getName(), dto);
            return ResponseEntity.ok(Map.of("message", "Perfil actualizado correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
