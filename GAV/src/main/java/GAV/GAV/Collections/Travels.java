package GAV.GAV.Collections;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.Date;
import java.util.Objects;

@Document(collection = "travels")
public class Travels {
    @Id
    private String id;

    private int NumberPassengers;
    private TravelStatus travelStatus;
    private BigDecimal FinalPrice;
    private Date RequestDate;
    private Date CancellationDate;
    private Date StartDate;
    private Date EndDate;

    public enum TravelStatus {
        REQUESTED, ASSIGNED,
        CANCELLED, REJECTED,
        IN_PROGRESS, FINISHED,
        ACCEPTED
    }
    private String idClient;
    private String idDriver;
    private String idCar;
    private String idLocation;

    public Travels() {
    }

    public Travels(String id, int numberPassengers, TravelStatus travelStatus, BigDecimal finalPrice, Date requestDate, Date cancellationDate, Date startDate, Date endDate,
                   String idClient, String idDriver, String idCar, String idLocation) {
        this.id = id;
        NumberPassengers = numberPassengers;
        this.travelStatus = travelStatus;
        FinalPrice = finalPrice;
        RequestDate = requestDate;
        CancellationDate = cancellationDate;
        StartDate = startDate;
        EndDate = endDate;
        this.idClient = idClient;
        this.idDriver = idDriver;
        this.idCar = idCar;
        this.idLocation = idLocation;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getNumberPassengers() {
        return NumberPassengers;
    }

    public void setNumberPassengers(int numberPassengers) {
        NumberPassengers = numberPassengers;
    }

    public TravelStatus getTravelStatus() {
        return travelStatus;
    }

    public void setTravelStatus(TravelStatus travelStatus) {
        this.travelStatus = travelStatus;
    }

    public BigDecimal getFinalPrice() {
        return FinalPrice;
    }

    public void setFinalPrice(BigDecimal finalPrice) {
        FinalPrice = finalPrice;
    }

    public Date getRequestDate() {
        return RequestDate;
    }

    public void setRequestDate(Date requestDate) {
        RequestDate = requestDate;
    }

    public Date getCancellationDate() {
        return CancellationDate;
    }

    public void setCancellationDate(Date cancellationDate) {
        CancellationDate = cancellationDate;
    }

    public Date getStartDate() {
        return StartDate;
    }

    public void setStartDate(Date startDate) {
        StartDate = startDate;
    }

    public Date getEndDate() {
        return EndDate;
    }

    public void setEndDate(Date endDate) {
        EndDate = endDate;
    }

    public String getIdClient() {
        return idClient;
    }

    public void setIdClient(String idClient) {
        this.idClient = idClient;
    }

    public String getIdDriver() {
        return idDriver;
    }

    public void setIdDriver(String idDriver) {
        this.idDriver = idDriver;
    }

    public String getIdCar() {
        return idCar;
    }

    public void setIdCar(String idCar) {
        this.idCar = idCar;
    }

    public String getIdLocation() {
        return idLocation;
    }

    public void setIdLocation(String idLocation) {
        this.idLocation = idLocation;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Travels{" +
                "id='" + id + '\'' +
                ", NumberPassengers=" + NumberPassengers +
                ", travelStatus=" + travelStatus +
                ", FinalPrice=" + FinalPrice +
                ", RequestDate=" + RequestDate +
                ", CancellationDate=" + CancellationDate +
                ", StartDate=" + StartDate +
                ", EndDate=" + EndDate +
                ", idClient='" + idClient + '\'' +
                ", idDriver='" + idDriver + '\'' +
                ", idCar='" + idCar + '\'' +
                ", idLocation='" + idLocation + '\'' +
                '}';
    }
}
