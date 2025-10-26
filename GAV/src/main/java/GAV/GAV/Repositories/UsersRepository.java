package GAV.GAV.Repositories;

import GAV.GAV.Collections.Users;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsersRepository extends MongoRepository<Users, String> {

    @Override
    Optional<Users> findById(String id);

    Optional<Users>findByUsername(String Username);

    Optional<Users>findByIdAndRol(String id, Users.Roles roles);

    Optional<Users>findByLicense(String license);

    Optional<Users>findByEmail(String email);

    Optional<Users> findByDocumentNumber(String documentNumber);

    Optional<Users> findByNumber(String number);

    Optional<Users> findByIdCars(String idCars);

    boolean existsByIdCars(String idCars);

    boolean existsByUsername(String Username);

    boolean existsByDocumentNumber(String documentNumber);

    boolean existsByEmail(String email);

    boolean existsByNumber(String number);

    List<Users> findByRol(Users.Roles rol);

    List<Users> findByRolAndAvailabilityTrue(Users.Roles rol);
}
