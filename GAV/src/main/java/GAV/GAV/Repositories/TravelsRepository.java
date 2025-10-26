package GAV.GAV.Repositories;

import GAV.GAV.Collections.Travels;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface TravelsRepository extends MongoRepository<Travels, String> {

    List<Travels> findByIdClient(String idClient);

    List<Travels> findByIdDriver(String idDriver);

    List<Travels> findByTravelStatus(Travels.TravelStatus travelStatus);

    List<Travels> findByTravelStatusIn(List<Travels.TravelStatus> statuses);

    List<Travels> findByIdCar(String idCar);

    List<Travels> findByRequestDate(Date requestDate);

    List<Travels> findByIdClientAndTravelStatusIn(String idClient, List<Travels.TravelStatus> statuses);

    List<Travels> findByIdDriverAndTravelStatusIn(String idDriver, List<Travels.TravelStatus> statuses);
}

