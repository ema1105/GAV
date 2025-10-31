package GAV.GAV.Controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping("/")
    public String home() {
        return "GAV Backend activo y funcionando correctamente.";
    }
    @GetMapping("/test")
    public String test() {
        return "Aplicación ejecutándose correctamente";
    }
}
