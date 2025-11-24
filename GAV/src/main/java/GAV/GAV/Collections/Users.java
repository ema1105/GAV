package GAV.GAV.Collections;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.Objects;

@Document(collection = "users")
public class Users {

    @Id
    private String id;

    private String fullname;
    private String lastname;

    @Indexed(unique = true)
    private String username;
    private String password;
    private String email;
    private String profilePictureUrl;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date birthday;

    @Indexed(unique = true)
    private String documentNumber;
    private DocumentType documentType;

    @Indexed(unique = true)
    private String number;

    @Indexed
    private Roles rol;
    private Sex sex;
    private int age;

    //atributos del conductor
    @Indexed
    private Boolean availability;
    private String license;
    private LicenseType licenseType;

    private String idCars;

    public enum DocumentType {
        CEDULA,
        PASAPORTE,
        CEDULA_EXTRANJERIA
    }

    public enum LicenseType {
        B1 , B2, B3, C1, C2, C3
    }
    public enum Roles {
        DRIVER,
        CLIENT,
        ADMINISTRATOR
    }
    public enum Sex {
        MALE, FEMALE
    }

    public Users() {}

    public Users(String id, String fullname, String lastname, String username, String password, String email,
                 Date birthday, String documentNumber, DocumentType documentType,
                 String number, Roles rol, Sex sex, int age, Boolean availability,
                 String license, LicenseType licenseType, String idCars,
                 String profilePictureUrl) {
        this.id = id;
        this.fullname = fullname;
        this.lastname = lastname;
        this.username = username;
        this.password = password;
        this.email = email;
        this.profilePictureUrl = profilePictureUrl;
        this.birthday = birthday;
        this.documentNumber = documentNumber;
        this.documentType = documentType;
        this.number = number;
        this.rol = rol;
        this.sex = sex;
        this.age = age;
        this.availability = availability;
        this.license = license;
        this.licenseType = licenseType;
        this.idCars = idCars;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Date getBirthday() {
        return birthday;
    }

    public void setBirthday(Date birthday) {
        this.birthday = birthday;
    }

    public String getDocumentNumber() {
        return documentNumber;
    }

    public void setDocumentNumber(String documentNumber) {
        this.documentNumber = documentNumber;
    }

    public DocumentType getDocumentType() {
        return documentType;
    }

    public void setDocumentType(DocumentType documentType) {
        this.documentType = documentType;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public Roles getRol() {
        return rol;
    }

    public void setRol(Roles rol) {
        this.rol = rol;
    }

    public Sex getSex() {
        return sex;
    }

    public void setSex(Sex sex) {
        this.sex = sex;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public Boolean getAvailability() {
        return availability;
    }

    public void setAvailability(Boolean availability) {
        this.availability = availability;
    }

    public String getLicense() {
        return license;
    }

    public void setLicense(String license) {
        this.license = license;
    }

    public LicenseType getLicenseType() {
        return licenseType;
    }

    public void setLicenseType(LicenseType licenseType) {
        this.licenseType = licenseType;
    }

    public String getIdCars() {
        return idCars;
    }

    public void setIdCars(String idCars) {
        this.idCars = idCars;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Users users = (Users) o;
        return Objects.equals(getId(), users.getId()) && Objects.equals(getUsername(), users.getUsername()) && Objects.equals(getEmail(),
                users.getEmail()) && Objects.equals(getDocumentNumber(), users.getDocumentNumber()) && Objects.equals(getNumber(), users.getNumber()) && Objects.equals(getLicense(), users.getLicense()) && Objects.equals(getIdCars(), users.getIdCars());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId(), getUsername(), getEmail(), getDocumentNumber(), getNumber(), getLicense(), getIdCars());
    }

    @Override
    public String toString() {
        return "Users{" +
                "id='" + id + '\'' +
                ", fullname='" + fullname + '\'' +
                ", lastname='" + lastname + '\'' +
                ", Username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", email='" + email + '\'' +
                ", birthday=" + birthday +
                ", documentNumber='" + documentNumber + '\'' +
                ", documentType=" + documentType +
                ", number='" + number + '\'' +
                ", rol=" + rol +
                ", sex=" + sex +
                ", age=" + age +
                ", availability=" + availability +
                ", license='" + license + '\'' +
                ", licenseType=" + licenseType +
                ", IdCars='" + idCars + '\'' +
                '}';
    }
}