package GAV.GAV.Collections;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.Objects;

@Document(collection = "rating")
public class Rating {
    @Id
    private String id;

    private String IdTravels;

    private int punctuation;
    private String comments;
    private Date QualificationDate;

    private TypeQualification typeQualification;

    public enum TypeQualification {
        CLIENT_TO_DRIVER, DRIVER_TO_CLIENT
    }
    private String idTravel;
    private String idQualifier;
    private String idQualified;

    public Rating() {
    }

    public Rating(String id, String idTravels, int punctuation, String comments, Date qualificationDate,
                  TypeQualification typeQualification, String idTravel, String idQualifier, String idQualified) {
        this.id = id;
        IdTravels = idTravels;
        this.punctuation = punctuation;
        this.comments = comments;
        QualificationDate = qualificationDate;
        this.typeQualification = typeQualification;
        this.idTravel = idTravel;
        this.idQualifier = idQualifier;
        this.idQualified = idQualified;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getIdTravels() {
        return IdTravels;
    }

    public void setIdTravels(String idTravels) {
        IdTravels = idTravels;
    }

    public int getPunctuation() {
        return punctuation;
    }

    public void setPunctuation(int punctuation) {
        this.punctuation = punctuation;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Date getQualificationDate() {
        return QualificationDate;
    }

    public void setQualificationDate(Date qualificationDate) {
        QualificationDate = qualificationDate;
    }

    public TypeQualification getTypeQualification() {
        return typeQualification;
    }

    public void setTypeQualification(TypeQualification typeQualification) {
        this.typeQualification = typeQualification;
    }

    public String getIdTravel() {
        return idTravel;
    }

    public void setIdTravel(String idTravel) {
        this.idTravel = idTravel;
    }

    public String getIdQualifier() {
        return idQualifier;
    }

    public void setIdQualifier(String idQualifier) {
        this.idQualifier = idQualifier;
    }

    public String getIdQualified() {
        return idQualified;
    }

    public void setIdQualified(String idQualified) {
        this.idQualified = idQualified;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Rating rating = (Rating) o;
        return Objects.equals(getId(), rating.getId()) && Objects.equals(getIdQualifier(),
                rating.getIdQualifier()) && Objects.equals(getIdQualified(), rating.getIdQualified());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId(), getIdQualifier(), getIdQualified());
    }

    @Override
    public String toString() {
        return "Rating{" +
                "id='" + id + '\'' +
                ", IdTravels='" + IdTravels + '\'' +
                ", punctuation=" + punctuation +
                ", comments='" + comments + '\'' +
                ", QualificationDate=" + QualificationDate +
                ", typeQualification=" + typeQualification +
                ", idTravel='" + idTravel + '\'' +
                ", idQualifier='" + idQualifier + '\'' +
                ", idQualified='" + idQualified + '\'' +
                '}';
    }
}
