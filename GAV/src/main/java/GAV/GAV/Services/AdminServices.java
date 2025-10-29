package GAV.GAV.Services;

import org.springframework.stereotype.Service;

import GAV.GAV.Collections.Cars;
import GAV.GAV.Collections.Travels;
import GAV.GAV.Collections.Users;
import GAV.GAV.DTO.DriverAvaibleDTO;
import GAV.GAV.DTO.PendingRequestDTO;
import GAV.GAV.DTO.TravelClientResponse;
import GAV.GAV.Repositories.CarsRepository;
import GAV.GAV.Repositories.LocationRepository;
import GAV.GAV.Repositories.TravelsRepository;
import GAV.GAV.Repositories.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AdminServices {
    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private CarsRepository carsRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private TravelsRepository travelsRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // -------------------- CONDUCTORES --------------------

    public Users registerDriver(Users driver) {
        if (usersRepository.existsByUsername(driver.getUsername()))
            throw new RuntimeException("El nombre de usuario ya está en uso.");

        if (usersRepository.existsByEmail(driver.getEmail()))
            throw new RuntimeException("El correo electrónico ya está registrado.");

        if (usersRepository.existsByDocumentNumber(driver.getDocumentNumber()))
            throw new RuntimeException("El número de documento ya está registrado.");

        if (usersRepository.existsByNumber(driver.getNumber()))
            throw new RuntimeException("El número de teléfono ya está registrado.");

        if (driver.getIdCars() != null && usersRepository.existsByIdCars(driver.getIdCars()))
            throw new RuntimeException("El vehículo ya está asignado a otro conductor.");

        driver.setPassword(passwordEncoder.encode(driver.getPassword()));
        driver.setRol(Users.Roles.DRIVER);
        driver.setAvailability(true);

        return usersRepository.save(driver);
    }

    public List<Users> getAllDrivers() {
        return usersRepository.findByRol(Users.Roles.DRIVER);
    }

    public void deleteDriver(String id) {
        if (!usersRepository.existsById(id))
            throw new RuntimeException("Conductor no encontrado.");
        usersRepository.deleteById(id);
    }

    public Users updateDriver(Users updatedDriver) {
        if (updatedDriver.getId() == null)
            throw new RuntimeException("El ID del conductor es obligatorio.");

        Users existing = usersRepository.findById(updatedDriver.getId())
                .orElseThrow(() -> new RuntimeException("Conductor no encontrado."));

        usersRepository.findByUsername(updatedDriver.getUsername())
                .filter(u -> !u.getId().equals(updatedDriver.getId()))
                .ifPresent(u -> { throw new RuntimeException("El nombre de usuario ya está en uso."); });

        usersRepository.findByEmail(updatedDriver.getEmail())
                .filter(u -> !u.getId().equals(updatedDriver.getId()))
                .ifPresent(u -> { throw new RuntimeException("El correo electrónico ya está registrado."); });

        usersRepository.findByDocumentNumber(updatedDriver.getDocumentNumber())
                .filter(u -> !u.getId().equals(updatedDriver.getId()))
                .ifPresent(u -> { throw new RuntimeException("El número de documento ya está registrado."); });

        usersRepository.findByNumber(updatedDriver.getNumber())
                .filter(u -> !u.getId().equals(updatedDriver.getId()))
                .ifPresent(u -> { throw new RuntimeException("El teléfono ya está registrado."); });

        if (updatedDriver.getIdCars() != null) {
            usersRepository.findByIdCars(updatedDriver.getIdCars())
                    .filter(u -> !u.getId().equals(updatedDriver.getId()))
                    .ifPresent(u -> { throw new RuntimeException("El vehículo ya está asignado a otro conductor."); });
        }

        if (updatedDriver.getPassword() != null && !updatedDriver.getPassword().isEmpty()) {
            updatedDriver.setPassword(passwordEncoder.encode(updatedDriver.getPassword()));
        } else {
            updatedDriver.setPassword(existing.getPassword());
        }

        updatedDriver.setRol(Users.Roles.DRIVER);
        return usersRepository.save(updatedDriver);
    }

    // -------------------- VEHÍCULOS --------------------

    public Cars registerCar(Cars car) {
        if (carsRepository.existsByPlate(car.getPlate()))
            throw new RuntimeException("La placa ya está registrada.");
        return carsRepository.save(car);
    }

    public List<Cars> getAllCars() {
        return carsRepository.findAll();
    }

    public void deleteCar(String id) {
        if (!carsRepository.existsById(id))
            throw new RuntimeException("Vehículo no encontrado.");
        carsRepository.deleteById(id);
    }

    public Cars updateCar(Cars car) {
        if (carsRepository.existsByPlateAndIdNot(car.getPlate(), car.getId()))
            throw new RuntimeException("La placa ya está registrada por otro vehículo.");
        return carsRepository.save(car);
    }

    public Optional<Cars> getCarById(String id) {
        return carsRepository.findById(id);
    }

    // -------------------- SOLICITUDES Y ASIGNACIONES --------------------

    public List<PendingRequestDTO> getPendingRequests() {
        List<Travels> travels = travelsRepository.findByTravelStatus(Travels.TravelStatus.REQUESTED);

        return travels.stream().map(travel -> {
            String destinationName = travel.getIdLocation() != null
                    ? travel.getIdLocation()
                    : "Destino no especificado";

            Users client = usersRepository.findById(travel.getIdClient()).orElse(null);
            String clientName = (client != null)
                    ? client.getFullname() + " " + client.getLastname()
                    : "Desconocido";

            return new PendingRequestDTO(
                    travel.getId(),
                    destinationName,
                    clientName,
                    travel.getNumberPassengers(),
                    travel.getRequestDate()
            );
        }).toList();
    }

    public List<DriverAvaibleDTO> getAvailableDrivers(int passengers) {
        List<Users> availableDrivers = usersRepository.findByRolAndAvailabilityTrue(Users.Roles.DRIVER);
        List<DriverAvaibleDTO> result = new ArrayList<>();

        for (Users driver : availableDrivers) {
            if (driver.getIdCars() != null) {
                Cars car = carsRepository.findById(driver.getIdCars()).orElse(null);
                if (car != null && car.getCapacity() >= passengers) {
                    result.add(new DriverAvaibleDTO(
                            driver.getId(),
                            driver.getFullname() + " " + driver.getLastname(),
                            driver.getNumber(),
                            car
                    ));
                }
            }
        }
        return result;
    }

    @Transactional
    public void assignDriverToTravel(String travelId, String driverId) {
        Travels travel = travelsRepository.findById(travelId)
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado."));

        Users driver = usersRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Conductor no encontrado."));

        if (driver.getAvailability() == null || !driver.getAvailability() || driver.getIdCars() == null)
            throw new RuntimeException("El conductor no está disponible o no tiene vehículo asignado.");

        Cars car = carsRepository.findById(driver.getIdCars())
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado."));

        if (car.getCapacity() < travel.getNumberPassengers())
            throw new RuntimeException("El vehículo no tiene capacidad suficiente.");

        // Asignar datos
        travel.setIdDriver(driver.getId());
        travel.setIdCar(car.getId());
        travel.setTravelStatus(Travels.TravelStatus.ASSIGNED);

        driver.setAvailability(false);

        travelsRepository.save(travel);
        usersRepository.save(driver);
    }

    public List<TravelClientResponse> getAllTravelHistory() {
        List<Travels.TravelStatus> completedStatuses = List.of(
                Travels.TravelStatus.FINISHED,
                Travels.TravelStatus.CANCELLED
        );

        List<Travels> travels = travelsRepository.findByTravelStatusIn(completedStatuses);

        return travels.stream().map(travel -> {
            String destinationName = travel.getIdLocation() != null
                    ? travel.getIdLocation()
                    : "Desconocido";

            TravelClientResponse.ConductorInfo driverInfo = null;
            if (travel.getIdDriver() != null) {
                Users driver = usersRepository.findById(travel.getIdDriver()).orElse(null);
                if (driver != null) {
                    driverInfo = new TravelClientResponse.ConductorInfo(
                            driver.getFullname() + " " + driver.getLastname(),
                            driver.getNumber()
                    );
                }
            }

            String duration = null;
            if (travel.getStartDate() != null && travel.getEndDate() != null) {
                long minutes = Duration.between(
                        travel.getStartDate().toInstant(),
                        travel.getEndDate().toInstant()
                ).toMinutes();
                long hours = minutes / 60;
                long mins = minutes % 60;
                duration = String.format("%02d:%02d", hours, mins);
            }

            return new TravelClientResponse(
                    travel.getId(),
                    travel.getNumberPassengers(),
                    travel.getTravelStatus().name(),
                    travel.getRequestDate(),
                    travel.getStartDate(),
                    travel.getEndDate(),
                    travel.getCancellationDate(),
                    destinationName,
                    driverInfo,
                    travel.getFinalPrice(),
                    duration
            );
        }).toList();
    }
}
