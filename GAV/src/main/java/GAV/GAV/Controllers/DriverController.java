package GAV.GAV.Controllers;

import GAV.GAV.DTO.TravelDriverResponse;
import GAV.GAV.Services.DriverServices;
import GAV.GAV.Collections.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/driver")
//@CrossOrigin(origins = "*") // Permite acceso desde Flutter u otro frontend
public class DriverController {

    @Autowired
    private DriverServices driverService;

    /**
     * 🔹 Obtener viajes asignados o en curso del conductor
     */
    @GetMapping("/{driverId}/travels")
    public ResponseEntity<?> getAssignedOrInProgressTravels(@PathVariable String driverId) {
        try {
            List<TravelDriverResponse> travels = driverService.getAssignedOrInProgressTravels(driverId);
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 🔹 Iniciar un viaje
     */
    @PostMapping("/travels/{travelId}/start")
    public ResponseEntity<?> startTravel(@PathVariable String travelId) {
        try {
            driverService.startTravel(travelId);
            return ResponseEntity.ok(Map.of("message", "Viaje iniciado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 🔹 Finalizar un viaje
     */
    @PostMapping("/travels/{travelId}/finish")
    public ResponseEntity<?> finishTravel(@PathVariable String travelId) {
        try {
            driverService.finishTravel(travelId);
            return ResponseEntity.ok(Map.of("message", "Viaje finalizado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 🔹 Obtener historial de viajes (finalizados o cancelados)
     */
    @GetMapping("/{driverId}/history")
    public ResponseEntity<?> getDriverTravelHistory(@PathVariable String driverId) {
        try {
            List<TravelDriverResponse> travels = driverService.getDriverTravelHistory(driverId);
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 🔹 Buscar conductor por username (útil si Flutter envía el nombre de usuario)
     */
    @GetMapping("/by-username/{username}")
    public ResponseEntity<?> getDriverByUsername(@PathVariable String username) {
        try {
            return driverService.findByUsername(username)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.badRequest().body(Map.of("error", "Conductor no encontrado")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
