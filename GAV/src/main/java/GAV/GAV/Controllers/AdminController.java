package GAV.GAV.Controllers;

import GAV.GAV.Collections.Cars;
import GAV.GAV.Collections.Locations;
import GAV.GAV.Collections.Users;
import GAV.GAV.DTO.DriverAvaibleDTO;
import GAV.GAV.DTO.PendingRequestDTO;
import GAV.GAV.DTO.TravelClientResponse;
import GAV.GAV.Services.AdminServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
//@CrossOrigin(origins = "*") // permite acceso desde Flutter
public class AdminController {

    @Autowired
    private AdminServices adminService;

    // -------------------- VEHÍCULOS --------------------

    @GetMapping("/cars")
    public List<Cars> getAllCars() {
        return adminService.getAllCars();

    }

    @PostMapping("/cars")
    public ResponseEntity<?> registerCar(@RequestBody Cars car) {
        try {
            Cars created = adminService.registerCar(car);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/cars/{id}")
    public ResponseEntity<?> getCarById(@PathVariable String id) {
        Optional<Cars> car = adminService.getCarById(id);
        return car.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Vehículo no encontrado")));
    }

    @PutMapping("/cars/{id}")
    public ResponseEntity<?> updateCar(@PathVariable String id, @RequestBody Cars car) {
        try {
            car.setId(id);
            Cars updated = adminService.updateCar(car);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/cars/{id}")
    public ResponseEntity<?> deleteCar(@PathVariable String id) {
        try {
            adminService.deleteCar(id);
            return ResponseEntity.ok(Map.of("message", "Vehículo eliminado correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // -------------------- CONDUCTORES --------------------

    @GetMapping("/drivers")
    public ResponseEntity<List<Users>> getAllDrivers() {
        return ResponseEntity.ok(adminService.getAllDrivers());
    }

    @PostMapping("/drivers")
    public ResponseEntity<?> registerDriver(@RequestBody Users driver) {
        try {
            Users created = adminService.registerDriver(driver);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/drivers/{id}")
    public ResponseEntity<?> getDriverById(@PathVariable String id) {
        Optional<Users> driver = adminService.getAllDrivers().stream()
                .filter(d -> d.getId().equals(id))
                .findFirst();

        return driver.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Conductor no encontrado")));
    }

    @PutMapping("/drivers/{id}")
    public ResponseEntity<?> updateDriver(@PathVariable String id, @RequestBody Users driver) {
        try {
            driver.setId(id);
            Users updated = adminService.updateDriver(driver);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/drivers/{id}")
    public ResponseEntity<?> deleteDriver(@PathVariable String id) {
        try {
            adminService.deleteDriver(id);
            return ResponseEntity.ok(Map.of("message", "Conductor eliminado correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // -------------------- LOCACIONES --------------------

    @Autowired
    private GAV.GAV.Repositories.LocationRepository locationRepository;

    @GetMapping("/locations")
    public ResponseEntity<List<Locations>> getAllLocations() {
        return ResponseEntity.ok(locationRepository.findAll());
    }

    @PostMapping("/locations")
    public ResponseEntity<?> registerLocation(@RequestBody Locations location) {
        try {
            Locations created = locationRepository.save(location);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/locations/{id}")
    public ResponseEntity<?> getLocationById(@PathVariable String id) {
        Optional<Locations> location = locationRepository.findById(id);
        return location.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Locación no encontrada")));
    }

    @PutMapping("/locations/{id}")
    public ResponseEntity<?> updateLocation(@PathVariable String id, @RequestBody Locations location) {
        try {
            location.setId(id);
            Locations updated = locationRepository.save(location);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/locations/{id}")
    public ResponseEntity<?> deleteLocation(@PathVariable String id) {
        try {
            locationRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Locación eliminada correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // -------------------- SOLICITUDES DE VIAJES --------------------

    @GetMapping("/travels/pending")
    public ResponseEntity<?> getPendingRequests() {
        try {
            List<PendingRequestDTO> requests = adminService.getPendingRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/drivers/available")
    public ResponseEntity<?> getAvailableDrivers(@RequestParam int passengers) {
        try {
            List<DriverAvaibleDTO> available = adminService.getAvailableDrivers(passengers);
            return ResponseEntity.ok(available);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/travels/assign")
    public ResponseEntity<?> assignDriverToTravel(@RequestBody Map<String, String> request) {
        try {
            String travelId = request.get("travelId");
            String driverId = request.get("driverId");
            adminService.assignDriverToTravel(travelId, driverId);
            return ResponseEntity.ok(Map.of("message", "Conductor asignado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // -------------------- HISTORIAL DE VIAJES --------------------

    @GetMapping("/travels/history")
    public ResponseEntity<?> getAllTravelHistory() {
        try {
            List<TravelClientResponse> history = adminService.getAllTravelHistory();
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener el historial: " + e.getMessage()));
        }
    }

}
