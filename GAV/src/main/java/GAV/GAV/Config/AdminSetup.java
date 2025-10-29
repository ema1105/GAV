package GAV.GAV.Config;

import GAV.GAV.Services.UsersService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminSetup implements CommandLineRunner {

    private final UsersService usersService;

    public AdminSetup(UsersService usersService) {
        this.usersService = usersService;
    }

    @Override
    public void run(String... args) throws Exception {

    }
}