package GAV.GAV.DTO;

import GAV.GAV.Collections.Cars;

public class DriverAvaibleDTO {
    private String id;
    private String nombreCompleto;
    private String telefono;
    private Cars car;

    public DriverAvaibleDTO() {
    }

    public DriverAvaibleDTO(String id, String nombreCompleto, String telefono, Cars car) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.telefono = telefono;
        this.car = car;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public Cars getCar() {
        return car;
    }

    public void setCar(Cars car) {
        this.car = car;
    }
}
