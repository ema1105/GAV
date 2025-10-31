package GAV.GAV;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "GAV.GAV")
public class  GavApplication {

	public static void main(String[] args) {
		SpringApplication.run(GavApplication.class, args);
	}

}
