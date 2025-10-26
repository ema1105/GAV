package GAV.GAV.Repositories.Custom;

import GAV.GAV.Collections.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import java.util.List;

@Repository
public class UserRepositoryCustomImpl implements UsersRepositoryCustom {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public List<Users> findUsersWithCars() {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.lookup("cars", "idCars", "_id", "carsInfo")
        );

        AggregationResults<Users> results =
                mongoTemplate.aggregate(aggregation, "users", Users.class);
        return results.getMappedResults();
    }
}
