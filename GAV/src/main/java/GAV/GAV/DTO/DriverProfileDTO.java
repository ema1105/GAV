package GAV.GAV.DTO;

public class DriverProfileDTO {
    private String fullname;
    private String lastname;
    private String email;
    private String number;
    private String profilePictureUrl;


    public DriverProfileDTO() {
    }

    public DriverProfileDTO(String fullname, String lastname, String email,
                            String number, String profilePictureUrl) {
        this.fullname = fullname;
        this.lastname = lastname;
        this.email = email;
        this.number = number;
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }
}
