package GAV.GAV.Repositories.Custom;

import GAV.GAV.Collections.Rating;
import java.util.List;

public interface RatingRepositoryCustom {
    List<Rating>findAllRatingsWithDetails();
}
