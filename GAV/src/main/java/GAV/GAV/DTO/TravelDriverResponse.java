package GAV.GAV.DTO;

import java.math.BigDecimal;
import java.util.Date;

public class TravelDriverResponse {
    private String id;
    private int numberPassengers;
    private String travelStatus;
    private Date requestDate;
    private Date startDate;
    private Date endDate;
    private Date cancellationDate;
    private String destinationName;
    private ClientInfo clientInfo;
    private BigDecimal finalPrice;
    private String travelDuration;

    public TravelDriverResponse() {}

    public TravelDriverResponse(String id, int numberPassengers, String travelStatus,
                                Date requestDate, Date startDate, Date endDate,
                                Date cancellationDate, String destinationName,
                                ClientInfo clientInfo, BigDecimal finalPrice, String travelDuration) {
        this.id = id;
        this.numberPassengers = numberPassengers;
        this.travelStatus = travelStatus;
        this.requestDate = requestDate;
        this.startDate = startDate;
        this.endDate = endDate;
        this.cancellationDate = cancellationDate;
        this.destinationName = destinationName;
        this.clientInfo = clientInfo;
        this.finalPrice = finalPrice;
        this.travelDuration = travelDuration;
    }

    public static class ClientInfo {
        private String fullName;
        private String phone;

        public ClientInfo(String fullName, String phone) {
            this.fullName = fullName;
            this.phone = phone;
        }


        public String getFullName() { return fullName; }
        public String getPhone() { return phone; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public int getNumberPassengers() { return numberPassengers; }
    public void setNumberPassengers(int numberPassengers) { this.numberPassengers = numberPassengers; }

    public String getTravelStatus() { return travelStatus; }
    public void setTravelStatus(String travelStatus) { this.travelStatus = travelStatus; }

    public Date getRequestDate() { return requestDate; }
    public void setRequestDate(Date requestDate) { this.requestDate = requestDate; }

    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }

    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }

    public Date getCancellationDate() { return cancellationDate; }
    public void setCancellationDate(Date cancellationDate) { this.cancellationDate = cancellationDate; }

    public String getDestinationName() { return destinationName; }
    public void setDestinationName(String destinationName) { this.destinationName = destinationName; }

    public ClientInfo getClientInfo() { return clientInfo; }
    public void setClientInfo(ClientInfo clientInfo) { this.clientInfo = clientInfo; }

    public BigDecimal getFinalPrice() { return finalPrice; }
    public void setFinalPrice(BigDecimal finalPrice) { this.finalPrice = finalPrice; }

    public String getTravelDuration() { return travelDuration; }
    public void setTravelDuration(String travelDuration) { this.travelDuration = travelDuration; }
}