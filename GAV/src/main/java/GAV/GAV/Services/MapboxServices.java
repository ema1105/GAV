package GAV.GAV.Services;

import GAV.GAV.Config.MapboxConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
public class MapboxServices {
    @Autowired
    private MapboxConfig mapboxConfig;

    @Autowired
    private RestTemplate restTemplate;

    // DTO simple para retorno
    public static class Coordinate {
        public double lon;
        public double lat;
        public Coordinate(double lon, double lat){ this.lon = lon; this.lat = lat; }
    }

    public static class RouteInfo {
        public double distanceMeters;
        public double durationSeconds;
        public RouteInfo(double distanceMeters, double durationSeconds){
            this.distanceMeters = distanceMeters;
            this.durationSeconds = durationSeconds;
        }
    }

    // Forward geocoding: devuelve la primera coincidencia
    public Coordinate forwardGeocode(String place) {
        try {
            String encodedPlace = URLEncoder.encode(place, StandardCharsets.UTF_8);
            String url = UriComponentsBuilder.fromHttpUrl(mapboxConfig.getGeocodingUrl())
                    .pathSegment(encodedPlace + ".json")
                    .queryParam("access_token", mapboxConfig.getToken())
                    .queryParam("limit", 1)
                    .queryParam("language", "es")
                    .toUriString();

            Map response = restTemplate.getForObject(url, Map.class);
            if (response == null || !response.containsKey("features")) {
                throw new RuntimeException("Respuesta inválida de Mapbox Geocoding");
            }

            List features = (List) response.get("features");
            if (features.isEmpty()) {
                throw new RuntimeException("No se encontraron coordenadas para: " + place);
            }

            Map first = (Map) features.get(0);
            List center = (List) first.get("center"); // [lon, lat]
            double lon = ((Number) center.get(0)).doubleValue();
            double lat = ((Number) center.get(1)).doubleValue();

            return new Coordinate(lon, lat);

        } catch (Exception ex) {
            throw new RuntimeException("Error en forwardGeocode: " + ex.getMessage(), ex);
        }
    }

    // Directions API: calcula distancia y duración entre dos puntos
    public RouteInfo getRoute(double fromLon, double fromLat, double toLon, double toLat) {
        try {
            String coords = String.format("%f,%f;%f,%f", fromLon, fromLat, toLon, toLat);
            String url = UriComponentsBuilder.fromHttpUrl(mapboxConfig.getDirectionsUrl())
                    .pathSegment(coords)
                    .queryParam("access_token", mapboxConfig.getToken())
                    .queryParam("geometries", "geojson")
                    .queryParam("overview", "full")
                    .toUriString();

            Map response = restTemplate.getForObject(url, Map.class);
            if (response == null || !response.containsKey("routes")) {
                throw new RuntimeException("Respuesta inválida de Mapbox Directions");
            }

            List routes = (List) response.get("routes");
            if (routes.isEmpty()) {
                throw new RuntimeException("No se encontraron rutas");
            }

            Map firstRoute = (Map) routes.get(0);
            double distance = ((Number) firstRoute.get("distance")).doubleValue(); // meters
            double duration = ((Number) firstRoute.get("duration")).doubleValue(); // seconds

            return new RouteInfo(distance, duration);

        } catch (Exception ex) {
            throw new RuntimeException("Error en getRoute: " + ex.getMessage(), ex);
        }
    }
}
