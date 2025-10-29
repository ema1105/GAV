package GAV.GAV.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MapboxConfig {
    @Value("${mapbox.api.token}")
    private String token;

    @Value("${mapbox.geocoding.url}")
    private String geocodingUrl;

    @Value("${mapbox.direcctions.url}")
    private String directionsUrl;

    public String getToken(){
        return token;
    }
    public String getGeocodingUrl(){
        return geocodingUrl;
    }
    public String getDirectionsUrl(){
        return geocodingUrl;
    }
}
