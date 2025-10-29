package GAV.GAV.Controllers;

import GAV.GAV.Collections.Travels;
import GAV.GAV.Services.TravelServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

public class TravelController {

    @Autowired
    private TravelServices travelService;

    @PostMapping("/create")
    public Travels createTravel(@RequestParam String destination,
                                @RequestParam String driverId,
                                @RequestParam String clientId,
                                @RequestParam String carId,
                                @RequestParam int passengers) {
        return travelService.createTravel(destination, driverId, clientId, carId, passengers);
    }
}
