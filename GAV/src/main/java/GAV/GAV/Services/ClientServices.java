package GAV.GAV.Services;
import GAV.GAV.Collections.Locations;
import GAV.GAV.Collections.Rating;
import GAV.GAV.Collections.Travels;
import GAV.GAV.Collections.Users;
import GAV.GAV.DTO.ClientProfileDTO;
import GAV.GAV.DTO.RatingRequestDTO;
import GAV.GAV.DTO.TravelClientResponse;
import GAV.GAV.DTO.TravelRequestDTO;
import GAV.GAV.Repositories.LocationRepository;
import GAV.GAV.Repositories.RatingRepository;
import GAV.GAV.Repositories.TravelsRepository;
import GAV.GAV.Repositories.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal; import java.math.RoundingMode;
import java.util.Date; import java.util.List; import java.util.Optional;

@Service
public class ClientServices {
    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private TravelsRepository travelsRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RatingRepository ratingRepository;

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

    //-----------------LOGICA DE VIAJES DEL CLIENTE-----------------//
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
            // Para viajes activos, rating
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
                    null,
                    null,
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
            // Obtener calificación del viaje
            Rating rating = ratingRepository.findByIdTravelAndTypeQualification(
                    viaje.getId(), Rating.TypeQualification.CLIENT_TO_DRIVER).orElse(null);

            Integer ratingValue = rating != null ? rating.getPunctuation() : null;
            String comment = rating != null ? rating.getComments() : null;

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
                    duration,
                    ratingValue,
                    comment
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

        if (passengers <=4) {
            return basePrice;
        }

        // Excedente por pasajero adicional
        double excedentePorPersona = 4000;
        int extras = passengers - 4;

        return basePrice + (excedentePorPersona * extras);
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

        // Crear el DTO sin la foto de perfil
        ClientProfileDTO profile = new ClientProfileDTO();
        profile.setFullname(client.getFullname());
        profile.setLastname(client.getLastname());
        profile.setEmail(client.getEmail());
        profile.setNumber(client.getNumber());
        return profile;
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

        return usersRepository.save(client);
    }

    //--------------CALIFICAR VIAJES----------------//
    @Transactional
    public void rateTravel(RatingRequestDTO ratingDTO, String username) {
        Users client = usersRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        Travels travel = travelsRepository.findById(ratingDTO.getTravelId())
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado"));

        // Verificar que el viaje pertenece al cliente
        if (!travel.getIdClient().equals(client.getId())) {
            throw new RuntimeException("No puedes calificar un viaje que no te pertenece");
        }

        // Verificar que el viaje está finalizado
        if (travel.getTravelStatus() != Travels.TravelStatus.FINISHED) {
            throw new RuntimeException("Solo puedes calificar viajes finalizados");
        }

        // Verificar que hay un conductor asignado
        if (travel.getIdDriver() == null) {
            throw new RuntimeException("No hay conductor asignado a este viaje");
        }

        // Verificar que la calificación es válida
        if (ratingDTO.getPunctuation() < 1 || ratingDTO.getPunctuation() > 5) {
            throw new RuntimeException("La calificación debe ser entre 1 y 5 estrellas");
        }

        // Verificar que no existe ya una calificación para este viaje
        if (ratingRepository.existsByIdTravelAndTypeQualification(
                travel.getId(), Rating.TypeQualification.CLIENT_TO_DRIVER)) {
            throw new RuntimeException("Ya has calificado este viaje");
        }

        // Crear la calificación
        Rating rating = new Rating();
        rating.setIdTravel(travel.getId());
        rating.setIdTravels(travel.getId());
        rating.setPunctuation(ratingDTO.getPunctuation());
        rating.setComments(ratingDTO.getComments());
        rating.setQualificationDate(new Date());
        rating.setTypeQualification(Rating.TypeQualification.CLIENT_TO_DRIVER);
        rating.setIdQualifier(client.getId()); // El cliente califica
        rating.setIdQualified(travel.getIdDriver()); // Al conductor

        ratingRepository.save(rating);
    }

    // Obtener calificación de un viaje
    public Rating getTravelRating(String travelId, String username) {
        Users client = usersRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        Travels travel = travelsRepository.findById(travelId)
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado"));

        // Verificar que el viaje pertenece al cliente
        if (!travel.getIdClient().equals(client.getId())) {
            throw new RuntimeException("No tienes permisos para ver este viaje");
        }

        return ratingRepository.findByIdTravelAndTypeQualification(
                        travelId, Rating.TypeQualification.CLIENT_TO_DRIVER)
                .orElse(null); // Retorna null si no existe calificación
    }

}


