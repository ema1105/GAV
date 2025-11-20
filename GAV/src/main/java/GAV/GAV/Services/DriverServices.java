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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.*;

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
    //OBTENER SOLICITUDES EN ESTADO REQUESTED
    public List<TravelDriverResponse> getTravelRequests(String driverId) {
        List<Travels.TravelStatus> estados = List.of(Travels.TravelStatus.REQUESTED);

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
    //ACEPTAR SOLICITUDES EN ESTADO REQUESTED->ACCEPTED
    public void acceptTravel(String travelId) {
        Travels travel = travelsRepository.findById(travelId)
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado"));

        // Validar que el viaje esté en estado REQUESTED
        if (travel.getTravelStatus() != Travels.TravelStatus.REQUESTED) {
            throw new RuntimeException("Solo se pueden aceptar viajes en estado SOLICITADO");
        }

        travel.setTravelStatus(Travels.TravelStatus.ACCEPTED);
        travelsRepository.save(travel);
    }

    /*Rechazar un viaje REQUESTED->REJECTED*/
    public void rejectTravel(String travelId) {
        Travels travel = travelsRepository.findById(travelId)
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado"));

        // Validar que el viaje esté en estado REQUESTED
        if (travel.getTravelStatus() != Travels.TravelStatus.REQUESTED) {
            throw new RuntimeException("Solo se pueden rechazar viajes en estado SOLICITADO");
        }

        travel.setTravelStatus(Travels.TravelStatus.REJECTED);
        // Opcional: liberar conductor para que pueda ser reasignado
        travel.setIdDriver(null);
        travelsRepository.save(travel);
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
                driver.getUsername()
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

        return usersRepository.save(driver);
    }

    //vaijes paginados
    public Page<TravelDriverResponse> getDriverTravelHistory(String driverId, int page, int size, String search) {
        List<Travels.TravelStatus> finalizados = List.of(
                Travels.TravelStatus.FINISHED,
                Travels.TravelStatus.CANCELLED,
                Travels.TravelStatus.REJECTED
        );

        Pageable pageable = PageRequest.of(page, size);
        Page<Travels> travelsPage;

        if (search != null && !search.trim().isEmpty()) {
            // Búsqueda por nombre de cliente o destino
            travelsPage = travelsRepository.findByIdDriverAndTravelStatusInAndSearch(
                    driverId, finalizados, search.toLowerCase(), pageable);
        } else {
            travelsPage = travelsRepository.findByIdDriverAndTravelStatusIn(driverId, finalizados, pageable);
        }

        return travelsPage.map(viaje -> {
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

            // === RETORNAR DTO ===
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


        });
    }

}
