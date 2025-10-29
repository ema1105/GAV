package GAV.GAV.Services;

import GAV.GAV.Collections.Locations;
import GAV.GAV.Collections.Travels;
import GAV.GAV.Collections.Users;
import GAV.GAV.DTO.DriverProfileDTO;
import GAV.GAV.DTO.TravelDriverResponse;
import GAV.GAV.Repositories.LocationRepository;
import GAV.GAV.Repositories.TravelsRepository;
import GAV.GAV.Repositories.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Date;
import java.util.List;
import java.util.Optional;
@Service
public class DriverServices {
    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private TravelsRepository travelsRepository;

    @Autowired
    private UsersRepository usersRepository;

    //Buscar un conductor por su username

    public Optional<Users> findByUsername(String username) {
        return usersRepository.findByUsername(username);
    }

    //Obtener viajes asignados o en curso para un conductor
    public List<TravelDriverResponse> getAssignedOrInProgressTravels(String driverId) {
        List<Travels.TravelStatus> estados = List.of(
                Travels.TravelStatus.ASSIGNED,
                Travels.TravelStatus.IN_PROGRESS
        );

        List<Travels> travels = travelsRepository.findByIdDriverAndTravelStatusIn(driverId, estados);

        return travels.stream().map(viaje -> {
            String destinoNombre = locationRepository.findById(viaje.getIdLocation())
                    .map(Locations::getDestination)
                    .orElse("Desconocido");

            // Buscar cliente asociado
            Users client = usersRepository.findById(viaje.getIdClient()).orElse(null);
            TravelDriverResponse.ClientInfo clientInfo = null;
            if (client != null) {
                clientInfo = new TravelDriverResponse.ClientInfo(
                        client.getFullname() + " " + client.getLastname(),
                        client.getNumber()
                );
            }

            return new TravelDriverResponse(
                    viaje.getId(),
                    viaje.getNumberPassengers(),
                    viaje.getTravelStatus().name(),
                    viaje.getRequestDate(),
                    viaje.getStartDate(),
                    viaje.getEndDate(),
                    viaje.getCancellationDate(),
                    destinoNombre,
                    clientInfo,
                    viaje.getFinalPrice(),
                    null
            );
        }).toList();
    }

    //Iniciar un viaje

    public void startTravel(String travelId) {
        Travels travel = travelsRepository.findById(travelId)
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado"));

        travel.setTravelStatus(Travels.TravelStatus.IN_PROGRESS);
        travel.setStartDate(new Date());
        travelsRepository.save(travel);
    }

    //Finalizar un viaje

    public void finishTravel(String travelId) {
        Travels travel = travelsRepository.findById(travelId)
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado"));

        travel.setTravelStatus(Travels.TravelStatus.FINISHED);
        travel.setEndDate(new Date());

        // Liberar conductor
        if (travel.getIdDriver() != null) {
            usersRepository.findById(travel.getIdDriver()).ifPresent(driver -> {
                driver.setAvailability(true);
                usersRepository.save(driver);
            });
        }

        travelsRepository.save(travel);
    }

    //Obtener historial de viajes finalizados o cancelados

    public List<TravelDriverResponse> getDriverTravelHistory(String driverId) {
        List<Travels.TravelStatus> finalizados = List.of(
                Travels.TravelStatus.FINISHED,
                Travels.TravelStatus.CANCELLED
        );

        List<Travels> travels = travelsRepository.findByIdDriverAndTravelStatusIn(driverId, finalizados);

        return travels.stream().map(viaje -> {
            String destinoNombre = locationRepository.findById(viaje.getIdLocation())
                    .map(Locations::getDestination)
                    .orElse("Desconocido");

            TravelDriverResponse.ClientInfo clientInfo = null;
            if (viaje.getIdClient() != null) {
                Users client = usersRepository.findById(viaje.getIdClient()).orElse(null);
                if (client != null) {
                    clientInfo = new TravelDriverResponse.ClientInfo(
                            client.getFullname() + " " + client.getLastname(),
                            client.getNumber()
                    );
                }
            }

            // Calcular duración del viaje
            String duracion = null;
            if (viaje.getStartDate() != null && viaje.getEndDate() != null) {
                long minutos = Duration.between(
                        viaje.getStartDate().toInstant(),
                        viaje.getEndDate().toInstant()
                ).toMinutes();
                long horas = minutos / 60;
                long minsRestantes = minutos % 60;
                duracion = String.format("%02d:%02d", horas, minsRestantes);
            }

            return new TravelDriverResponse(
                    viaje.getId(),
                    viaje.getNumberPassengers(),
                    viaje.getTravelStatus().name(),
                    viaje.getRequestDate(),
                    viaje.getStartDate(),
                    viaje.getEndDate(),
                    viaje.getCancellationDate(),
                    destinoNombre,
                    clientInfo,
                    viaje.getFinalPrice(),
                    duracion
            );
        }).toList();
    }
    // --------------------- PERFIL DEL CONDUCTOR ---------------------

    public DriverProfileDTO getProfile(String username) {
        Users driver = usersRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));

        return new DriverProfileDTO(
                driver.getFullname(),
                driver.getLastname(),
                driver.getEmail(),
                driver.getNumber(),
                driver.getProfilePictureUrl()
        );
    }

    public Users updateProfile(String username, DriverProfileDTO dto) {
        Users driver = usersRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));

        if (dto.getFullname() != null && !dto.getFullname().isEmpty())
            driver.setFullname(dto.getFullname());

        if (dto.getLastname() != null && !dto.getLastname().isEmpty())
            driver.setLastname(dto.getLastname());

        if (dto.getEmail() != null && !dto.getEmail().isEmpty())
            driver.setEmail(dto.getEmail());

        if (dto.getNumber() != null && !dto.getNumber().isEmpty())
            driver.setNumber(dto.getNumber());

        if (dto.getProfilePictureUrl() != null && !dto.getProfilePictureUrl().isEmpty())
            driver.setProfilePictureUrl(dto.getProfilePictureUrl());

        return usersRepository.save(driver);
    }
}
