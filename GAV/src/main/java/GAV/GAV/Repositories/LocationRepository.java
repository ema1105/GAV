package GAV.GAV.Repositories;

import GAV.GAV.Collections.Locations;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends MongoRepository<Locations, String> {

    Optional<Locations> findById(String id);

    Optional<Locations> findByDestination(String destination);

    boolean existsByLatitudeAndLongitude(double latitude, double longitude);

    boolean existsByDestination(String destination);

    List<Locations> findAllByDestinationNot(String destination);
}
