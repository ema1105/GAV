package GAV.GAV.DTO;

public class RatingRequestDTO {
    private String travelId;
    private int punctuation;
    private String comments;


    public RatingRequestDTO() {}

    public RatingRequestDTO(String travelId, int punctuation, String comments) {
        this.travelId = travelId;
        this.punctuation = punctuation;
        this.comments = comments;
    }

    // Getters y Setters
    public String getTravelId() { return travelId; }
    public void setTravelId(String travelId) { this.travelId = travelId; }
    public int getPunctuation() { return punctuation; }
    public void setPunctuation(int punctuation) { this.punctuation = punctuation; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
