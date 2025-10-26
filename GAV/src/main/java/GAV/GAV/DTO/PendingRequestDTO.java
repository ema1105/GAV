package GAV.GAV.DTO;

import java.util.Date;

public class PendingRequestDTO {
    private String id;
    private String destinoNombre;
    private String clienteNombre;
    private int cantidadPasajeros;
    private Date fechaSolicitud;

    public PendingRequestDTO() {
    }

    public PendingRequestDTO(String id, String destinoNombre, String clienteNombre, int cantidadPasajeros, Date fechaSolicitud) {
        this.id = id;
        this.destinoNombre = destinoNombre;
        this.clienteNombre = clienteNombre;
        this.cantidadPasajeros = cantidadPasajeros;
        this.fechaSolicitud = fechaSolicitud;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDestinoNombre() {
        return destinoNombre;
    }

    public void setDestinoNombre(String destinoNombre) {
        this.destinoNombre = destinoNombre;
    }

    public String getClienteNombre() {
        return clienteNombre;
    }

    public void setClienteNombre(String clienteNombre) {
        this.clienteNombre = clienteNombre;
    }

    public int getCantidadPasajeros() {
        return cantidadPasajeros;
    }

    public void setCantidadPasajeros(int cantidadPasajeros) {
        this.cantidadPasajeros = cantidadPasajeros;
    }

    public Date getFechaSolicitud() {
        return fechaSolicitud;
    }

    public void setFechaSolicitud(Date fechaSolicitud) {
        this.fechaSolicitud = fechaSolicitud;
    }
}
