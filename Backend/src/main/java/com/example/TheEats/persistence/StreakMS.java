package com.example.TheEats.persistence;

import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class StreakMS {

    private final RestClient restClient;

    public StreakMS(Environment env) {
        String baseUrl = env.getProperty("STREAKMSURL", "http://localhost:8080");
        String apiKey = env.getProperty("APIKEY");

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("MSAPIKEY", apiKey)
                .build();
    }

    public void sendJob(int userID, int streak) {
        class StreakReq {
            public final int uID;
            public final int streak;
            StreakReq(int uID, int streak) {
                this.uID = uID;
                this.streak = streak;
            }
        }

        try {
            restClient.post()
                .body(new StreakReq(userID, streak))
                .retrieve()
                .toBodilessEntity();

            System.out.println("StreakMS request sent successfully");

        } catch (RestClientException ex) {
            System.err.println("StreakMS request failed: " + ex.getMessage());
        }
    }
}