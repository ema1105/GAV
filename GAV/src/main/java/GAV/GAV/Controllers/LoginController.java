package GAV.GAV.Controllers;

import GAV.GAV.Collections.Users;
import GAV.GAV.Services.ClientServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class LoginController {

     @Autowired
     private ClientServices clientServices;

    @GetMapping("/login")
    public String loginPage() {
        return "login"; // Carga templates/login.html
    }

    @GetMapping("/register")
    public String registerPage() {
        return "register"; // Carga templates/register.html
    }
    // POST -> procesa el formulario del registro
    @PostMapping("/register")
    public String registerUser(@ModelAttribute Users user) {
        clientServices.registerClient(user);
        return "redirect:/login?success=true";
    }
}

