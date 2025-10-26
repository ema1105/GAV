package GAV.GAV.Controllers;

import GAV.GAV.Collections.Locations;
import GAV.GAV.Collections.Travels;
import GAV.GAV.Collections.Users;
import GAV.GAV.DTO.TravelClientResponse;
import GAV.GAV.DTO.TravelRequestDTO;

import GAV.GAV.Services.ClientServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "*") // Permite consumo desde Flutter
public class ClientController {

    @Autowired
    private ClientServices clientService;

    // 🔹 Registrar un nuevo cliente
    @PostMapping("/register")
    public ResponseEntity<?> registerClient(@RequestBody Users client) {
        try {
            if (clientService.usernameExists(client.getUsername())) {
                return ResponseEntity.badRequest().body(Map.of("error", "El nombre de usuario ya está en uso"));
            }
            if (clientService.emailExists(client.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "El correo ya está registrado"));
            }
            if (clientService.documentExists(client.getDocumentNumber())) {
                return ResponseEntity.badRequest().body(Map.of("error", "El número de documento ya existe"));
            }
            if (clientService.phoneExists(client.getNumber())) {
                return ResponseEntity.badRequest().body(Map.of("error", "El número telefónico ya existe"));
            }

            Users saved = clientService.registerClient(client);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // 🔹 Obtener lista de destinos disponibles
    @GetMapping("/destinations")
    public ResponseEntity<List<Locations>> getAvailableDestinations() {
        return ResponseEntity.ok(clientService.getAvailableDestinations());
    }

    // 🔹 Solicitar un nuevo viaje
    @PostMapping("/travels/request")
    public ResponseEntity<?> requestTravel(@RequestBody TravelRequestDTO request, Principal principal) {
        try {
            String username = principal.getName();
            Travels travel = clientService.requestTravel(request, username);
            return ResponseEntity.ok(Map.of(
                    "message", "Viaje solicitado correctamente",
                    "travelId", travel.getId()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 🔹 Obtener viajes activos del cliente
    @GetMapping("/travels/active")
    public ResponseEntity<?> getActiveTravels(Principal principal) {
        try {
            String username = principal.getName();
            Users client = clientService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

            List<TravelClientResponse> travels = clientService.getActiveClientTravels(client.getId());
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 🔹 Obtener historial de viajes (finalizados o cancelados)
    @GetMapping("/travels/history")
    public ResponseEntity<?> getTravelHistory(Principal principal) {
        try {
            String username = principal.getName();
            Users client = clientService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

            List<TravelClientResponse> history = clientService.getClientTravelHistory(client.getId());
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 🔹 Cancelar viaje activo
    @PutMapping("/travels/{id}/cancel")
    public ResponseEntity<?> cancelTravel(@PathVariable String id, Principal principal) {
        try {
            String username = principal.getName();
            clientService.cancelTravel(id, username);
            return ResponseEntity.ok(Map.of("message", "Viaje cancelado correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
