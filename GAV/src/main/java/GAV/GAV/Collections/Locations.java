package GAV.GAV.Collections;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.math.BigDecimal;
import java.util.Objects;

@Document(collection = "location")
public class Locations {
    @Id
    private String id;

    private String destination;
    private String description;
    private double latitude;
    private double longitude;

    private BigDecimal price;

    public Locations() {
    }

    public Locations(String id, String destination, String description,
                     double latitude, double longitude, BigDecimal price) {
        this.id = id;
        this.destination = destination;
        this.description = description;
        this.latitude = latitude;
        this.longitude = longitude;
        this.price = price;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    @Override
    public String toString() {
        return "Locations{" +
                "id='" + id + '\'' +
                ", destination='" + destination + '\'' +
                ", description='" + description + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", price=" + price +
                '}';
    }
}

