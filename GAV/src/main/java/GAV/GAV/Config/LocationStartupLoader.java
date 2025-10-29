package GAV.GAV.Config;

import GAV.GAV.Collections.Locations;
import GAV.GAV.Repositories.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class LocationStartupLoader implements CommandLineRunner {

    @Autowired
    private LocationRepository locationRepository;

    @Override
    public void run(String... args) {
        String HotelName = "Hotel Estelar Manzanillo del Mar";

        boolean existe = locationRepository.existsByDestination(HotelName);
        if (!existe) {
            Locations hotel = new Locations();
            hotel.setDestination(HotelName);
            hotel.setDescription("Punto de partida oficial para los viajes del hotel.");
            hotel.setLatitude(10.524580108158908);
            hotel.setLongitude(-75.49372752027492);
            hotel.setPrice(BigDecimal.ZERO);

            locationRepository.save(hotel);
            System.out.println("Locación base creada correctamente: " + HotelName);
        } else {
            System.out.println("Locación base ya existe: " + HotelName);
        }
    }
}
