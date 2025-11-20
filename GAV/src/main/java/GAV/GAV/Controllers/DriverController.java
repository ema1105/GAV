package GAV.GAV.Controllers;

import GAV.GAV.DTO.DriverProfileDTO;
import GAV.GAV.DTO.TravelDriverResponse;
import GAV.GAV.Services.DriverServices;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/driver")
public class DriverController {

    @Autowired
    private DriverServices driverService;

    //--------------VIAJES---------------//
    /*Obtener viajes asignados o en curso del conductor*/
    @GetMapping("/{driverId}/travels")
    public ResponseEntity<?> getAssignedOrInProgressTravels(@PathVariable String driverId) {
        try {
            List<TravelDriverResponse> travels = driverService.getAssignedOrInProgressTravels(driverId);
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    //OBTENER VIAJES EN EL ESTADO DE REQUESTED
    @GetMapping("/{driverId}/travel-requests")
    public ResponseEntity<?> getTravelRequests(@PathVariable String driverId) {
        try {
            List<TravelDriverResponse> travels = driverService.getTravelRequests(driverId);
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    //---------------ACEPTACION O RECHAZO DE UN VIAJE-------------//
    /*aceptar o rechazar*/
    @PostMapping("/travels/{travelId}/accept")
    public ResponseEntity<?> acceptTravel(@PathVariable String travelId) {
        try {
            driverService.acceptTravel(travelId);
            return ResponseEntity.ok(Map.of("message", "Viaje aceptado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }

    }
    @PostMapping("/travels/{travelId}/reject")
    public ResponseEntity<?> rejectTravel(@PathVariable String travelId) {
        try {
            driverService.rejectTravel(travelId);
            return ResponseEntity.ok(Map.of("message", "Viaje rechazado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /*Iniciar un viaje*/
    @PostMapping("/travels/{travelId}/start")
    public ResponseEntity<?> startTravel(@PathVariable String travelId) {
        try {
            driverService.startTravel(travelId);
            return ResponseEntity.ok(Map.of("message", "Viaje iniciado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /* Finalizar un viaje */
    @PostMapping("/travels/{travelId}/finish")
    public ResponseEntity<?> finishTravel(@PathVariable String travelId) {
        try {
            driverService.finishTravel(travelId);
            return ResponseEntity.ok(Map.of("message", "Viaje finalizado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /*Obtener historial de viajes (finalizados o cancelados)*/
    @GetMapping("/{driverId}/history")
    public ResponseEntity<?> getDriverTravelHistory(@PathVariable String driverId) {
        try {
            List<TravelDriverResponse> travels = driverService.getDriverTravelHistory(driverId);
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /*Buscar conductor por username */
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
    //--------------PERFIL------------------//

    // Obtener perfil del conductor autenticado
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Principal principal) {
        try {
            String username = principal.getName();
            DriverProfileDTO profile = driverService.getProfile(username);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Actualizar perfil del conductor
    @PutMapping("/profile")
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


    /*VIAJES PAGINADOS
    @GetMapping("/{driverId}/history")
    public ResponseEntity<?> getDriverTravelHistory(
            @PathVariable String driverId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        try {
            Page<TravelDriverResponse> travels = driverService.getDriverTravelHistory(driverId, page, size, search);
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }*/

}
