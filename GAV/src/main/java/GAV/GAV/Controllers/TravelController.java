package GAV.GAV.Controllers;

import GAV.GAV.Collections.Travels;
import GAV.GAV.Services.TravelServices;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/travels")
public class TravelController {

    @Autowired
    private TravelServices travelService;

    @PostMapping("/create")
    public Travels createTravel(@RequestParam(required = false) String destination,
                                @RequestParam String driverId,
                                @RequestParam String clientId,
                                @RequestParam String carId,
                                @RequestParam int passengers) {
        return travelService.createTravel(destination, driverId, clientId, carId, passengers);
    }

    //nuevo metodo para la request de un viaje
    @PostMapping("/client/travels/request")
    public ResponseEntity<?> requestTravel(@RequestParam String destination,
                                           @RequestParam String clientId,
                                           @RequestParam int passengers) {
        try {
            // Para viajes solicitados por clientes, driverId y carId son null inicialmente
            Travels travel = travelService.createTravel(destination, null, clientId, null, passengers);

            return ResponseEntity.ok(Map.of(
                    "message", "Viaje solicitado correctamente",
                    "travelId", travel.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

}
