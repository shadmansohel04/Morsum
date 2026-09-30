package com.example.TheEats;

import com.example.TheEats.persistence.DB;
import com.example.TheEats.business.PushMS;
import com.example.TheEats.persistence.Security;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//PLEASE CHANGE ANY MENTION OF USERID TO JWTTOKEN SOON PLEASE!!!!!

@RestController
@CrossOrigin
@RequestMapping("/profile")
public class ProfileController {
        
    private final DB repo;
    private final Security sec;
    private final PushMS push;
        
    private ProfileController(DB sql, Security sec, PushMS push){
        this.repo = sql;
        this.sec = sec;
        this.push = push;
    }
    
    @GetMapping("likedCards")
    public ResponseEntity<Map<String,Object>> getLikedCards(@RequestHeader("Authorization") String authHeader){
        Integer id = sec.validateToken(authHeader);
        Map<String, Object> response;
        if(id == null){
            response = Map.of(
                "success", false,
                "data", "token auth failed"
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        response = Map.of(
            "success", true,
            "data", repo.getLiked(id)
        );
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("notificationUpdate")
    public ResponseEntity<Map<String,Object>> updatePushToken(@RequestBody Map<String, String> body, @RequestHeader("Authorization") String authHeader){
        Map<String, Object> response;
        try{
            Integer userID = sec.validateToken(authHeader);
            String newToken = body.get("newToken");
            repo.updateNotificationToken(userID, newToken);
            response = Map.of(
                "success", true
            );
            return ResponseEntity.ok(response);
        }
        catch(Exception e){
            response = Map.of(
                "success", false
            );
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @DeleteMapping("deleteLiked")
    public ResponseEntity<Map<String,Object>> removeLikedCard(@RequestBody Map<String, String> body, @RequestHeader("Authorization") String authHeader){
        Map<String, Object> response;
        try{
            Integer userID = sec.validateToken(authHeader);
            Integer recipeID = Integer.parseInt(body.get("recipeID"));  
            
            if(repo.removeLiked(recipeID, userID)){
                response = Map.of(
                    "success", true
                );            
                return ResponseEntity.ok(response);   
            }
            response = Map.of(
                "success", false
            );
            return ResponseEntity.badRequest().body(response);
        }
        catch(Exception e){
            response = Map.of(
                "success", false
            );
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("sendMessage")
    public ResponseEntity<Map<String,Object>> sendMessage(){
        Map<String, Object> response;
        try{
            push.sendExpoPush("jennierlay", "Spaghetti Bolognese^^vv4^^vvhttps://foodimgbuck.s3.us-east-2.amazonaws.com/dc850539-bfaf-4bec-a0e0-c21e5d70d25a.png", "12:1");
            response = Map.of(
            "success", true
            );  
            return ResponseEntity.ok(response);
        }
        catch(Exception e){
            response = Map.of(
            "success", true
            );
            return ResponseEntity.badRequest().body(response);
        }
    }


}
