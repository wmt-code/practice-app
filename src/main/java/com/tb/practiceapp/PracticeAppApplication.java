package com.tb.practiceapp;

import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PracticeAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(PracticeAppApplication.class, args);
	}

}
