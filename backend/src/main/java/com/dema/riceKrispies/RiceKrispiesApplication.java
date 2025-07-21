package com.dema.riceKrispies;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class RiceKrispiesApplication {

	public static void main(String[] args) {
		// Load .env.dev file
		Dotenv dotenv = Dotenv.configure()
			.filename(".env.dev")
			.ignoreIfMissing()
			.load();
		SpringApplication.run(RiceKrispiesApplication.class, args);
	}

}
