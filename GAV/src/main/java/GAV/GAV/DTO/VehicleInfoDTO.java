package GAV.GAV.DTO;

public class VehicleInfoDTO {
    private String placa;
    private String modelo;
    private String tipoLicencia;
    private String numeroLicencia;

    public VehicleInfoDTO() {
    }

    public VehicleInfoDTO(String placa, String modelo, String tipoLicencia, String numeroLicencia) {
        this.placa = placa;
        this.modelo = modelo;
        this.tipoLicencia = tipoLicencia;
        this.numeroLicencia = numeroLicencia;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public String getTipoLicencia() {
        return tipoLicencia;
    }

    public void setTipoLicencia(String tipoLicencia) {
        this.tipoLicencia = tipoLicencia;
    }

    public String getNumeroLicencia() {
        return numeroLicencia;
    }

    public void setNumeroLicencia(String numeroLicencia) {
        this.numeroLicencia = numeroLicencia;
    }
}