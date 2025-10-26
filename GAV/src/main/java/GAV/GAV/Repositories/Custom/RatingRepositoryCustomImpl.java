package GAV.GAV.Repositories.Custom;

import GAV.GAV.Collections.Rating;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;

import java.util.List;

public class RatingRepositoryCustomImpl implements RatingRepositoryCustom{
    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public List<Rating> findAllRatingsWithDetails() {
        Aggregation aggregation = Aggregation.newAggregation(
                // Unido con travels
                Aggregation.lookup("travels", "idTravel", "_id", "travelInfo"),

                // Unido con users: calificador
                Aggregation.lookup("users", "idQualifier", "_id", "qualifierInfo"),

                // Unido con users: calificado
                Aggregation.lookup("users", "idQualified", "_id", "qualifiedInfo")
        );

        AggregationResults<Rating> results =
                mongoTemplate.aggregate(aggregation, "rating", Rating.class);
        return results.getMappedResults();
    }
}
