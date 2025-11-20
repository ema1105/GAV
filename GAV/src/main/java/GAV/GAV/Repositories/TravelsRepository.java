package GAV.GAV.Repositories;

import GAV.GAV.Collections.Travels;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
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



    Page<Travels> findByIdDriverAndTravelStatusIn(String driverId, List<Travels.TravelStatus> travelStatus, Pageable pageable);

    // Para búsqueda - necesitarás una consulta @Query personalizada
    @Query("SELECT t FROM Travels t WHERE t.idDriver = :driverId AND t.travelStatus IN :travelStatus AND " +
            "(LOWER(t.idClient) IN (SELECT u.id FROM Users u WHERE LOWER(u.fullname) LIKE LOWER(CONCAT('%', :search, '%'))) OR " +
            "LOWER(t.idLocation) IN (SELECT l.id FROM Locations l WHERE LOWER(l.destination) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<Travels> findByIdDriverAndTravelStatusInAndSearch(
            @Param("driverId") String driverId,
            @Param("travelStatus") List<Travels.TravelStatus> travelStatus,
            @Param("search") String search,
            Pageable pageable);
}

