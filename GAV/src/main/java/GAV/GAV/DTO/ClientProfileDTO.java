package GAV.GAV.DTO;

public class ClientProfileDTO {
    private String fullname;
    private String lastname;
    private String email;
    private String number;
    private String password;

    public ClientProfileDTO() {
    }

    public ClientProfileDTO(String fullname, String lastname, String email,
                            String number, String password) {
        this.fullname = fullname;
        this.lastname = lastname;
        this.email = email;
        this.number = number;
        this.password = password;

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
