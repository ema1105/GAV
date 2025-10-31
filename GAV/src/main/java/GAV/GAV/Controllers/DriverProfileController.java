package GAV.GAV.Controllers;

import GAV.GAV.DTO.DriverProfileDTO;
import GAV.GAV.Services.DriverServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/driver/profile")
public class DriverProfileController {
    @Autowired
    private DriverServices driverService;

    // Obtener perfil del conductor autenticado
    @GetMapping
    public ResponseEntity<?> getProfile(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Conductor no autenticado"));
            }

            var profile = driverService.getProfile(principal.getName());
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Actualizar perfil del conductor
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody DriverProfileDTO dto, Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Conductor no autenticado"));
            }

            driverService.updateProfile(principal.getName(), dto);
            return ResponseEntity.ok(Map.of("message", "Perfil actualizado correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
