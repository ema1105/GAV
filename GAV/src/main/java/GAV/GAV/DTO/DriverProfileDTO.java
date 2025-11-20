package GAV.GAV.DTO;

public class DriverProfileDTO {
    private String fullname;
    private String lastname;
    private String email;
    private String number;
    private String username;


    public DriverProfileDTO() {
    }

    public DriverProfileDTO(String fullname, String lastname, String email,
                            String number, String username) {
        this.fullname = fullname;
        this.lastname = lastname;
        this.email = email;
        this.number = number;

        this.username = username;
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



    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
