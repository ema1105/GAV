package GAV.GAV.Repositories.Custom;


import GAV.GAV.Collections.Travels;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class TravelsRepositoryCustomImpl implements TravelsRepositoryCustom {
    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public List<Travels> findAllTravelsWithReferences() {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.lookup("users", "idClient", "_id", "clientInfo"),
                Aggregation.lookup("users", "idDriver", "_id", "driverInfo"),
                Aggregation.lookup("cars", "idCar", "_id", "carInfo"),
                Aggregation.lookup("location", "idLocation", "_id", "locationInfo")
        );

        AggregationResults<Travels> results =
                mongoTemplate.aggregate(aggregation, "travels", Travels.class);
        return results.getMappedResults();
    }


}
