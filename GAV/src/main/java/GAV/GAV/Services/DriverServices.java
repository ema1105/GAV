package GAV.GAV.Services;

import GAV.GAV.Collections.Cars;
import GAV.GAV.Collections.Locations;
import GAV.GAV.Collections.Travels;
import GAV.GAV.Collections.Users;
import GAV.GAV.DTO.DriverProfileDTO;
import GAV.GAV.DTO.TravelDriverResponse;
import GAV.GAV.DTO.VehicleInfoDTO;
import GAV.GAV.Repositories.CarsRepository;
import GAV.GAV.Repositories.LocationRepository;
import GAV.GAV.Repositories.TravelsRepository;
import GAV.GAV.Repositories.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.User;
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

    @Autowired
    private CarsRepository carsRepository;

    //Buscar un conductor por su username
    public Optional<Users> findByUsername(String username) {
        return usersRepository.findByUsername(username);
    }

    // --------------------- PERFIL DEL CONDUCTOR ---------------------//
    //OBTENER PERFIL DEL CONDUCTOR
    public DriverProfileDTO getProfile(String username){
        Users driver = usersRepository.findByUsername(username)
                .orElseThrow(()-> new RuntimeException("Conductor no encontradi"));
        return new DriverProfileDTO(
                driver.getFullname(),
                driver.getLastname(),
                driver.getEmail(),
                driver.getNumber(),
                driver.getUsername()
        );
    }

    //ACTUALIZAR PERFIL O DATOS DEL CONDUCTOR
    public Users updateProfile(String username, DriverProfileDTO dto){
        Users driver = usersRepository.findByUsername(username)
                .orElseThrow(()-> new RuntimeException("Conductor no encontrado"));
        if (dto.getFullname()!= null && !dto.getFullname().trim().isEmpty()){
            driver.setFullname(dto.getFullname().trim());
        }
        if (dto.getLastname()!= null && !dto.getLastname().trim().isEmpty()){
            driver.setLastname(dto.getLastname().trim());
        }
        if (dto.getEmail()!= null && !dto.getEmail().trim().isEmpty()){
            if (!isValidEmail(dto.getEmail())){
                throw new RuntimeException("Formato de email invalido");
            }
            driver.setEmail(dto.getEmail().trim());
        }
        if (dto.getNumber() != null &&!dto.getNumber().trim().isEmpty()){
            driver.setEmail(dto.getNumber().trim());
        }
        return usersRepository.save(driver);
    }
    private boolean isValidEmail(String email){
        return email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }

    //-----------------------VEHICULO INFO-------------------------------//
    public VehicleInfoDTO getVehicleInfo(String driverId) {
        Users driver = usersRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));

        if (driver.getIdCars() == null || driver.getIdCars().trim().isEmpty()) {
            throw new RuntimeException("Conductor no tiene vehículo asignado");
        }

        // Verificar que el vehículo existe antes de intentar acceder a él
        Cars vehicle = carsRepository.findById(driver.getIdCars())
                .orElseThrow(() -> new RuntimeException("Vehículo asignado no encontrado en la base de datos. Por favor, contacte al administrador."));

        return new VehicleInfoDTO(
                vehicle.getPlate(),
                vehicle.getModel(),
                driver.getLicenseType() != null ? driver.getLicenseType().name() : "No especificado",
                driver.getLicense()
        );
    }

    //------------------------------VIAJES--------------------------------//
    public List<TravelDriverResponse> getAssignedOrInProgressTravels(String driverId) {
        List<Travels.TravelStatus> estados = List.of(
                Travels.TravelStatus.ASSIGNED,
                Travels.TravelStatus.ACCEPTED,
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
    //solicitudes - ahora busca viajes ASSIGNED (asignados por el admin)
    public List<TravelDriverResponse> getTravelRequests(String driverId) {
        List<Travels.TravelStatus> estados = List.of(Travels.TravelStatus.ASSIGNED);
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
    //aceptar viaje - ahora acepta viajes ASSIGNED
    public void acceptTravel(String travelId) {
        Travels travel = travelsRepository.findById(travelId)
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado"));

        if (travel.getTravelStatus() != Travels.TravelStatus.ASSIGNED) {
            throw new RuntimeException("Solo se pueden aceptar viajes en estado ASIGNADO");
        }

        travel.setTravelStatus(Travels.TravelStatus.ACCEPTED);
        travelsRepository.save(travel);
    }
    //rechazar viaje - ahora rechaza viajes ASSIGNED y libera el conductor
    public void rejectTravel(String travelId) {
        Travels travel = travelsRepository.findById(travelId)
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado"));

        if (travel.getTravelStatus() != Travels.TravelStatus.ASSIGNED) {
            throw new RuntimeException("Solo se pueden rechazar viajes en estado ASIGNADO");
        }

        // Cambiar estado a REJECTED y liberar el conductor para que el admin pueda reasignarlo
        travel.setTravelStatus(Travels.TravelStatus.REJECTED);
        travel.setIdDriver(null);
        travel.setIdCar(null);
        travelsRepository.save(travel);
    }
    //iniciar viaje - solo se puede iniciar si está ACCEPTED
    public void startTravel(String travelId) {
        Travels travel = travelsRepository.findById(travelId)
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado"));

        if (travel.getTravelStatus() != Travels.TravelStatus.ACCEPTED) {
            throw new RuntimeException("Solo se pueden iniciar viajes en estado ACEPTADO. Por favor, acepta el viaje primero.");
        }

        travel.setTravelStatus(Travels.TravelStatus.IN_PROGRESS);
        travel.setStartDate(new Date());

        // Marcar conductor como no disponible
        Users driver = usersRepository.findById(travel.getIdDriver())
                .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));
        driver.setAvailability(false);
        usersRepository.save(driver);

        travelsRepository.save(travel);
    }
    //finalizar viaje
    public void finishTravel(String travelId) {
        Travels travel = travelsRepository.findById(travelId)
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado"));

        if (travel.getTravelStatus() != Travels.TravelStatus.IN_PROGRESS) {
            throw new RuntimeException("Solo se pueden finalizar viajes en estado EN_PROGRESS");
        }

        travel.setTravelStatus(Travels.TravelStatus.FINISHED);
        travel.setEndDate(new Date());

        // Liberar conductor
        Users driver = usersRepository.findById(travel.getIdDriver()).orElse(null);
        if (driver != null) {
            driver.setAvailability(true);
            usersRepository.save(driver);
        }

        travelsRepository.save(travel);
    }
    //historial
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
    // ========== HISTORIAL PAGINADO ==========
    public Page<TravelDriverResponse> getDriverTravelHistory(String driverId, int page, int size, String search) {
        List<Travels.TravelStatus> finalizados = List.of(
                Travels.TravelStatus.FINISHED,
                Travels.TravelStatus.CANCELLED,
                Travels.TravelStatus.REJECTED
        );

        Pageable pageable = PageRequest.of(page, size);
        Page<Travels> travelsPage;

        if (search != null && !search.trim().isEmpty()) {
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
    
    // Obtener suma de precios de viajes completados en el día actual
    public double getDailyEarnings(String driverId) {
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Date startOfDay = calendar.getTime();
        
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        calendar.set(Calendar.MILLISECOND, 999);
        Date endOfDay = calendar.getTime();
        
        List<Travels.TravelStatus> finalizados = List.of(Travels.TravelStatus.FINISHED);
        List<Travels> travels = travelsRepository.findByIdDriverAndTravelStatusIn(driverId, finalizados);
        
        return travels.stream()
                .filter(travel -> {
                    Date endDate = travel.getEndDate();
                    return endDate != null && 
                           endDate.compareTo(startOfDay) >= 0 && 
                           endDate.compareTo(endOfDay) <= 0;
                })
                .mapToDouble(travel -> travel.getFinalPrice() != null ? travel.getFinalPrice().doubleValue() : 0.0)
                .sum();
    }
}
