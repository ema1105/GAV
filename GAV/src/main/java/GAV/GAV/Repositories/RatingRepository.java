package GAV.GAV.Repositories;


import GAV.GAV.Collections.Rating;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends MongoRepository<Rating, String> {

    List<Rating> findByIdQualifier(String idQualifier);

    // Buscar calificaciones recibidas por un usuario (driver o client)
    List<Rating> findByIdQualified(String idQualified);

    // Buscar calificaciones por tipo (CLIENT_TO_DRIVER o DRIVER_TO_CLIENT)
    List<Rating> findByTypeQualification(Rating.TypeQualification typeQualification);

    // Buscar calificación por viaje y tipo
    Optional<Rating> findByIdTravelAndTypeQualification(String idTravel, Rating.TypeQualification typeQualification);

    // Buscar calificaciones por conductor
    List<Rating> findByIdQualifiedAndTypeQualification(String idQualified, Rating.TypeQualification typeQualification);

    // Verificar si ya existe calificación para un viaje
    boolean existsByIdTravelAndTypeQualification(String idTravel, Rating.TypeQualification typeQualification);

}
