package GAV.GAV.Services;

import GAV.GAV.Collections.Locations;
import GAV.GAV.Collections.Travels;
import GAV.GAV.Repositories.LocationRepository;
import GAV.GAV.Repositories.TravelsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Date;
import java.util.Optional;

@Service
public class TravelServices {
    //ESTABLECEMOS EL ORIGEN FIJO QUE SERÁ EL HOTEL
    public static final double ORIGIN_LON = -75.49372752027492;
    public static final double ORIGIN_LAT = 10.524580108158908;

    @Autowired
    private MapboxServices mapboxService;

    @Autowired
    private TravelsRepository travelsRepository;

    @Autowired
    private LocationRepository locationRepository;

    public Travels createTravel(String destinationName,
                                String driverId,
                                String clientId,
                                String carId,
                                int passengers) {

        //  Buscar si ya existe una Location con ese destino
        Optional<Locations> existingLocation = locationRepository.findByDestination(destinationName);
        Locations location;

        if (existingLocation.isPresent()) {
            location = existingLocation.get();
        } else {
            // Obtener coordenadas y calcular distancia
            MapboxServices.Coordinate destCoord = mapboxService.forwardGeocode(destinationName);
            MapboxServices.RouteInfo route = mapboxService.getRoute(ORIGIN_LON, ORIGIN_LAT, destCoord.lon, destCoord.lat);

            // Calcular precio estimado
            BigDecimal price = estimatePrice(route.distanceMeters, route.durationSeconds);

            //  Crear Location y guardar
            location = new Locations();
            location.setDestination(destinationName);
            location.setDescription("Destino generado automáticamente");
            location.setLatitude(destCoord.lat);
            location.setLongitude(destCoord.lon);
            location.setPrice(price);
            location = locationRepository.save(location);
        }
        //Crear y guardar Travel (solo referencia a Location)
        Travels travel = new Travels();
        travel.setIdClient(clientId);
        travel.setIdDriver(driverId);
        travel.setIdCar(carId);
        travel.setIdLocation(location.getId());
        travel.setNumberPassengers(passengers);
        travel.setTravelStatus(Travels.TravelStatus.REQUESTED);
        travel.setFinalPrice(location.getPrice());
        travel.setRequestDate(new Date());

        // Guardar en MongoDB
        return travelsRepository.save(travel);
    }
    private BigDecimal estimatePrice(double distanceMeters, double durationSeconds) {
        double tarifaBase = 5000;  // COP
        double porKm = 1000;
        double porMinuto = 100;

        double kms = distanceMeters / 1000.0;
        double minutos = durationSeconds / 60.0;

        double total = tarifaBase + (porKm * kms) + (porMinuto * minutos);
        return BigDecimal.valueOf(Math.round(total * 100.0) / 100.0);
    }
}