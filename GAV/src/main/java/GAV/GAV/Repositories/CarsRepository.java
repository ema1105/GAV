package GAV.GAV.Repositories;

import GAV.GAV.Collections.Cars;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarsRepository extends MongoRepository<Cars,String> {

    boolean existsByPlate(String plate);

    Cars findByPlate(String plate);

    boolean existsByPlateAndIdNot(String plate, String id);
}
