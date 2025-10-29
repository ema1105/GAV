package GAV.GAV.Services;
import GAV.GAV.Collections.Locations;
import GAV.GAV.Collections.Travels;
import GAV.GAV.Collections.Users;
import GAV.GAV.DTO.ClientProfileDTO;
import GAV.GAV.DTO.TravelClientResponse;
import GAV.GAV.DTO.TravelRequestDTO;
import GAV.GAV.Repositories.LocationRepository;
import GAV.GAV.Repositories.TravelsRepository;
import GAV.GAV.Repositories.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal; import java.math.RoundingMode;
import java.util.Date; import java.util.List; import java.util.Optional;

public class ClientServices {
    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private TravelsRepository travelsRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    //Buscar un cliente por username

    public Optional<Users> findByUsername(String username) {
        return usersRepository.findByUsername(username);
    }

    //Verificar si un username ya existe

    public boolean usernameExists(String username) {
        return usersRepository.existsByUsername(username);
    }

    public boolean emailExists(String email) {
        return usersRepository.existsByEmail(email);
    }

    public boolean documentExists(String documentNumber) {
        return usersRepository.existsByDocumentNumber(documentNumber);
    }

    public boolean phoneExists(String number) {
        return usersRepository.existsByNumber(number);
    }

    //Registrar un nuevo cliente

    public Users registerClient(Users client) {
        client.setPassword(passwordEncoder.encode(client.getPassword()));
        client.setRol(Users.Roles.CLIENT);
        return usersRepository.save(client);
    }

    // LOGICA DE VIAJES DEL CLIENTE

    private static final String FIXED_ORIGIN = "Hotel Estelar Manzanillo del Mar";

    //Obtener destinos disponibles (excepto el origen fijo)

    public List<Locations> getAvailableDestinations() {
        return locationRepository.findAllByDestinationNot(FIXED_ORIGIN);
    }

    //Solicitar un nuevo viaje

    public Travels requestTravel(TravelRequestDTO request, String usernameClient) {
        Users client = usersRepository.findByUsername(usernameClient)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        // Verificar si tiene viajes activos
        List<Travels.TravelStatus> activeStatuses = List.of(
                Travels.TravelStatus.REQUESTED,
                Travels.TravelStatus.ASSIGNED,
                Travels.TravelStatus.IN_PROGRESS
        );

        boolean hasActiveTravel = !travelsRepository
                .findByIdClientAndTravelStatusIn(client.getId(), activeStatuses)
                .isEmpty();

        if (hasActiveTravel) {
            throw new RuntimeException("Ya tienes un viaje activo. No puedes solicitar otro.");
        }

        Locations destination = locationRepository.findById(request.getDestinationId())
                .orElseThrow(() -> new RuntimeException("Destino no encontrado"));

        Travels travel = new Travels();
        travel.setIdClient(client.getId());
        travel.setIdLocation(destination.getId());
        travel.setIdDriver(null);
        travel.setNumberPassengers(request.getPassengersCount());
        travel.setTravelStatus(Travels.TravelStatus.REQUESTED);
        travel.setRequestDate(new Date());
        travel.setFinalPrice(BigDecimal.valueOf(calculateFinalPrice(travel))
                .setScale(2, RoundingMode.HALF_UP));

        return travelsRepository.save(travel);
    }

    //Obtener viajes activos de un cliente

    public List<TravelClientResponse> getActiveClientTravels(String clientId) {
        List<Travels.TravelStatus> activeStatuses = List.of(
                Travels.TravelStatus.REQUESTED,
                Travels.TravelStatus.ASSIGNED,
                Travels.TravelStatus.IN_PROGRESS
        );

        List<Travels> travels = travelsRepository.findByIdClientAndTravelStatusIn(clientId, activeStatuses);

        return travels.stream().map(viaje -> {
            String destinationName = locationRepository.findById(viaje.getIdLocation())
                    .map(Locations::getDestination)
                    .orElse("Desconocido");

            TravelClientResponse.ConductorInfo driverInfo = null;
            if (viaje.getIdDriver() != null) {
                Users driver = usersRepository.findById(viaje.getIdDriver()).orElse(null);
                if (driver != null) {
                    driverInfo = new TravelClientResponse.ConductorInfo(
                            driver.getFullname() + " " + driver.getLastname(),
                            driver.getNumber()
                    );
                }
            }

            return new TravelClientResponse(
                    viaje.getId(),
                    viaje.getNumberPassengers(),
                    viaje.getTravelStatus().name(),
                    viaje.getRequestDate(),
                    viaje.getStartDate(),
                    viaje.getEndDate(),
                    viaje.getCancellationDate(),
                    destinationName,
                    driverInfo,
                    viaje.getFinalPrice(),
                    null
            );
        }).toList();
    }

    //Obtener historial de viajes finalizados o cancelados de un cliente

    public List<TravelClientResponse> getClientTravelHistory(String clientId) {
        List<Travels.TravelStatus> finishedStatuses = List.of(
                Travels.TravelStatus.FINISHED,
                Travels.TravelStatus.CANCELLED
        );

        List<Travels> travels = travelsRepository.findByIdClientAndTravelStatusIn(clientId, finishedStatuses);

        return travels.stream().map(viaje -> {
            String destinationName = locationRepository.findById(viaje.getIdLocation())
                    .map(Locations::getDestination)
                    .orElse("Desconocido");

            TravelClientResponse.ConductorInfo driverInfo = null;
            if (viaje.getIdDriver() != null) {
                Users driver = usersRepository.findById(viaje.getIdDriver()).orElse(null);
                if (driver != null) {
                    driverInfo = new TravelClientResponse.ConductorInfo(
                            driver.getFullname() + " " + driver.getLastname(),
                            driver.getNumber()
                    );
                }
            }

            String duration = null;
            if (viaje.getStartDate() != null && viaje.getEndDate() != null) {
                long minutes = (viaje.getEndDate().getTime() - viaje.getStartDate().getTime()) / (60 * 1000);
                long hours = minutes / 60;
                long mins = minutes % 60;
                duration = String.format("%02d:%02d", hours, mins);
            }

            return new TravelClientResponse(
                    viaje.getId(),
                    viaje.getNumberPassengers(),
                    viaje.getTravelStatus().name(),
                    viaje.getRequestDate(),
                    viaje.getStartDate(),
                    viaje.getEndDate(),
                    viaje.getCancellationDate(),
                    destinationName,
                    driverInfo,
                    viaje.getFinalPrice(),
                    duration
            );
        }).toList();
    }

    // Cancelar viaje activo

    @Transactional
    public void cancelTravel(String travelId, String usernameClient) {
        Travels travel = travelsRepository.findById(travelId)
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado"));

        Users client = usersRepository.findByUsername(usernameClient)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        if (!travel.getIdClient().equals(client.getId())) {
            throw new RuntimeException("No puedes cancelar un viaje que no te pertenece");
        }

        if (travel.getTravelStatus() != Travels.TravelStatus.REQUESTED &&
                travel.getTravelStatus() != Travels.TravelStatus.ASSIGNED) {
            throw new RuntimeException("El viaje no se puede cancelar en este estado");
        }

        if (travel.getIdDriver() != null) {
            usersRepository.findById(travel.getIdDriver()).ifPresent(driver -> {
                driver.setAvailability(true);
                usersRepository.save(driver);
            });
        }

        travel.setTravelStatus(Travels.TravelStatus.CANCELLED);
        travel.setCancellationDate(new Date());
        travelsRepository.save(travel);
    }

    // Cálculo de precio final según número de pasajeros

    public double calculateFinalPrice(Travels travel) {
        Locations destination = locationRepository.findById(travel.getIdLocation())
                .orElseThrow(() -> new RuntimeException("Destino no encontrado"));

        double basePrice = destination.getPrice().doubleValue();
        int passengers = travel.getNumberPassengers();

        if (passengers <= 4) return basePrice;

        int extra = passengers - 4;
        double increase = 1 + (0.05 * extra);
        return basePrice * increase;
    }
    public Users login(String username, String password) {
        Optional<Users> userOpt = usersRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        Users user = userOpt.get();

        // Verifica la contraseña
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Contraseña incorrecta");
        }
        return user;
    }
    // --------------------- PERFIL DEL CLIENTE ---------------------

    public ClientProfileDTO getProfile(String username) {
        Users client = usersRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        return new ClientProfileDTO(
                client.getFullname(),
                client.getLastname(),
                client.getEmail(),
                client.getNumber(),
                client.getProfilePictureUrl()
        );
    }

    public Users updateProfile(String username, ClientProfileDTO dto) {
        Users client = usersRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        if (dto.getFullname() != null && !dto.getFullname().isEmpty())
            client.setFullname(dto.getFullname());

        if (dto.getLastname() != null && !dto.getLastname().isEmpty())
            client.setLastname(dto.getLastname());

        if (dto.getEmail() != null && !dto.getEmail().isEmpty())
            client.setEmail(dto.getEmail());

        if (dto.getNumber() != null && !dto.getNumber().isEmpty())
            client.setNumber(dto.getNumber());

        if (dto.getProfilePictureUrl() != null && !dto.getProfilePictureUrl().isEmpty())
            client.setProfilePictureUrl(dto.getProfilePictureUrl());

        return usersRepository.save(client);
    }

}


