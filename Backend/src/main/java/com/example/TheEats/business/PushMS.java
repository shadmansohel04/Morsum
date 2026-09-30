package com.example.TheEats.business;

import com.example.TheEats.persistence.DB;
import java.util.Arrays;
import java.util.Map;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class PushMS {
    
    private final RestClient restClient;
    private final DB repo;

    public PushMS(Environment env, DB repo) {
        this.restClient = RestClient.builder()
            .baseUrl("https://exp.host")
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
        this.repo = repo;
    }
    
    public boolean sendExpoPush(String sender, String content, String room) {
        try{
            String[] people = room.split(":");
            Integer big = Integer.parseInt(people[0]);
            Integer small = Integer.parseInt(people[1]);
            if(big <= small){
                throw new Exception("failed parse");
            }
            String toSend = repo.getPush(sender, big, small);
            if(toSend == null){
                return false;
            }
            String contentModified = content.replace("^^vv", ":::");
            String[] split = contentModified.split(":::");
            System.out.println(Arrays.toString(split));
            
            String toSendContent;
            if(split.length == 3){
                toSendContent = "Recipe: " + split[0];
            }
            else{
                toSendContent = content;
            }            
            Map<String, Object> payload = Map.of(
                "to", toSend,
                "title", sender,
                "body", toSendContent
            );
            
            System.out.println(payload);

            String response = restClient.post()
                .uri("/--/api/v2/push/send")
                .body(payload)
                .retrieve()
                .body(String.class);

            System.out.println(response);
            return true;
        }
        catch(Exception e){
            System.out.println(e.getMessage());
            return false;
        }    
    }

    
}
