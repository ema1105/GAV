package GAV.GAV.Controllers;

import GAV.GAV.DTO.DriverProfileDTO;
import GAV.GAV.DTO.TravelDriverResponse;
import GAV.GAV.DTO.VehicleInfoDTO;
import GAV.GAV.Services.DriverServices;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.data.domain.Page;
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

    //-------------PERFIL CONDUCTOR-----------------//
    //obtener el perfil
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no autenticado"));
            }
            DriverProfileDTO profile = driverService.getProfile(principal.getName());
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    //actualizar perfil
    @PutMapping("/profile/update")
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

    //------------INFORMACIÓN DEL VEHÍCULO---------//
    //obtner info del carro
    @GetMapping("/{driverId}/vehicle-info")
    public ResponseEntity<?> getVehicleInfo(@PathVariable String driverId) {
        try {
            VehicleInfoDTO vehicleInfo = driverService.getVehicleInfo(driverId);
            return ResponseEntity.ok(vehicleInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ---------VIAJES ASIGNADOS Y EN CURSO---------//
    @GetMapping("/{driverId}/travels")
    public ResponseEntity<?> getAssignedOrInProgressTravels(@PathVariable String driverId) {
        try {
            List<TravelDriverResponse> travels = driverService.getAssignedOrInProgressTravels(driverId);
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    //------------SOLICITUDES DE VIAJES---------------//

    //Obtener solicitudes de viaje en REQUESTED
    @GetMapping("/{driverId}/travel-requests")
    public ResponseEntity<?> getTravelRequests(@PathVariable String driverId) {
        try {
            List<TravelDriverResponse> travels = driverService.getTravelRequests(driverId);
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    //Aceptar una solicitud de viaje
    @PostMapping("/travels/{travelId}/accept")
    public ResponseEntity<?> acceptTravel(@PathVariable String travelId) {
        try {
            driverService.acceptTravel(travelId);
            return ResponseEntity.ok(Map.of("message", "Viaje aceptado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    // Rechazar una solicitud de viaje
    @PostMapping("/travels/{travelId}/reject")
    public ResponseEntity<?> rejectTravel(@PathVariable String travelId) {
        try {
            driverService.rejectTravel(travelId);
            return ResponseEntity.ok(Map.of("message", "Viaje rechazado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    //------------- VIAJES EN CURSO--------------//
    //Iniciar un viaje (cambiar a IN_PROGRESS)
    @PostMapping("/travels/{travelId}/start")
    public ResponseEntity<?> startTravel(@PathVariable String travelId) {
        try {
            driverService.startTravel(travelId);
            return ResponseEntity.ok(Map.of("message", "Viaje iniciado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    //Finalizar un viaje (cambiar a FINISHED)
    @PostMapping("/travels/{travelId}/finish")
    public ResponseEntity<?> finishTravel(@PathVariable String travelId) {
        try {
            driverService.finishTravel(travelId);
            return ResponseEntity.ok(Map.of("message", "Viaje finalizado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    //-------------HISTORIAL--------------//
    //Obtener historial de viajes
    @GetMapping("/{driverId}/history")
    public ResponseEntity<?> getDriverTravelHistory(@PathVariable String driverId) {
        try {
            List<TravelDriverResponse> travels = driverService.getDriverTravelHistory(driverId);
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    //Obtener historial de viajes con paginación y búsqueda
    @GetMapping("/{driverId}/history/paginated")
    public ResponseEntity<?> getDriverTravelHistoryPaginated(
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
    }
    //-------------BUSQUEDA DE CONDUCTORES--------------//
    @GetMapping("/by-username/{username}")
    public ResponseEntity<?> getDriverByUsername(@PathVariable String username) {
        try {
            return driverService.findByUsername(username)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Obtener ID del conductor autenticado
    @GetMapping("/my-id")
    public ResponseEntity<?> getMyDriverId(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no autenticado"));
            }

            return driverService.findByUsername(principal.getName())
                    .map(user -> ResponseEntity.ok(Map.of("driverId", user.getId())))
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Obtener ganancias del día
    @GetMapping("/{driverId}/daily-earnings")
    public ResponseEntity<?> getDailyEarnings(@PathVariable String driverId) {
        try {
            double earnings = driverService.getDailyEarnings(driverId);
            return ResponseEntity.ok(Map.of("dailyEarnings", earnings));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

}
