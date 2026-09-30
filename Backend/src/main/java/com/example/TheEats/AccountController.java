package com.example.TheEats;

import com.example.TheEats.persistence.AccountDB;
import com.example.TheEats.persistence.S3;
import com.example.TheEats.persistence.Security;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin
@RequestMapping("/account")
public class AccountController {
    
    @Autowired
    private AccountDB repo;
    @Autowired
    private Security sec;
    @Autowired
    private S3 s3;
        
    @PutMapping("/updateProfilePic")
    public ResponseEntity<Map<String,Object>> updatePic(@RequestHeader("Authorization") String authHeader, @RequestParam("frame") MultipartFile file){
        Map<String, Object> response;
        int userID = sec.validateToken(authHeader);
        try{
            String current = repo.getAvatar(userID);
            boolean status = s3.deleteIMG(current);
            String avatarURL = s3.uploadIMG(file);
            if(!repo.updateAvatar("https://foodimgbuck.s3.us-east-2.amazonaws.com/"+avatarURL, userID)){
                throw new Exception("failed tranaction");
            }
            response = Map.of(
                "success", true,
                "url", "https://foodimgbuck.s3.us-east-2.amazonaws.com/" + avatarURL
            );
            return ResponseEntity.ok(response);
        }catch(Exception e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);   
        }
    }
    
    @PostMapping("/friendRequest")
    public ResponseEntity<Map<String,Object>> freindRequest(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> body){
        Map<String, Object> response;
        try{
            int userID = sec.validateToken(authHeader);
            String friendUserName = body.get("username");
            if(repo.friendRequest(userID, friendUserName)){
                response = Map.of(
                "success", true
                );
                return ResponseEntity.ok(response);        
            }
            throw new Exception("request failed");
        }
        catch(Exception e){
            response = Map.of(
                "success", false,
                "Error", e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @DeleteMapping("/deleteFriend")
    public ResponseEntity<Map<String,Object>> deleteFriend(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> body){
        Map<String, Object> response;
        try{
            int userID = sec.validateToken(authHeader);
            int friendID = Integer.parseInt(body.get("friendID"));
            
            repo.deleteFriend(userID, friendID);
            response = Map.of(
            "success", true
            );
            return ResponseEntity.ok(response);
        }
        catch(Exception e){
            e.printStackTrace();
            response = Map.of(
                "success", false,
                "Error", e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }   
    }
    
    @GetMapping("/getFriends")
    public ResponseEntity<List<Map<String,Object>>> getFriends(@RequestHeader("Authorization") String authHeader){
        try{
            int userID = sec.validateToken(authHeader);
            return ResponseEntity.ok(repo.getFriends(userID));
        }
        catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/acceptFriend")
    public ResponseEntity<Map<String,Object>> acceptFriend(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, Integer> body){
        Map<String, Object> response;
        try{
            int userID = sec.validateToken(authHeader);
            int friendID = body.get("friendID");
            
            repo.acceptFriend(userID, friendID);
            response = Map.of(
            "success", true
            );
            return ResponseEntity.ok(response);
        }
        catch(Exception e){
            response = Map.of(
                "success", false,
                "Error", e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }   
    }
    @PostMapping("/findPeople")
    public ResponseEntity<List<Map<String,Object>>> findPeople(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, Object> body){
        try{
            int userID = sec.validateToken(authHeader);
            String text = (String) body.get("search");
            if (text.isBlank() || text.isEmpty()){
                throw new Exception("blank");
            }
            return ResponseEntity.ok(repo.findPeople(userID, text));
        }
        catch(Exception e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);            
        }
    }
    
    
    @PostMapping("/createAccount")
    public ResponseEntity<Map<String,Object>> createAccount(@RequestBody Map<String, String> body){
        String email = body.get("email");
        String password = body.get("password");
        String userName = body.get("username");
        
        try{
            if(email.isEmpty() || !email.contains("@") || !email.contains(".")){
                throw new Exception("invalid email");
            }
                        
            if(password.isEmpty() || password.length() < 6){
                throw new Exception("invalid password");
            }
            
            String encoded = sec.hashPassword(password);
            
            if(!repo.createUser(email, encoded, userName)){
                throw new Exception("sql failed");
            }

            Map<String, Object> response = Map.of(
            "success", true
            );
            return ResponseEntity.ok(response);            
        }
        catch(Exception e){
            System.out.println("failed to make person " + e.toString());
            return ResponseEntity.badRequest().body(null);
        }          
    }
    
    @PutMapping("/authToken")
    public ResponseEntity<Map<String,Object>> AuthenticateToken(@RequestHeader("Authorization") String authHeader){
        Integer fromToken = sec.validateToken(authHeader);
        String newToken = sec.generateToken(fromToken.toString());
        if(newToken != null){
            Map<String, Object> response = Map.of(
                "authorized", true,
                "newToken", newToken
            );
            return ResponseEntity.ok(response);                
        }
        else{
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<Map<String,Object>> loginAccount(@RequestBody Map<String, String> body){
        String email = body.get("email");
        String password = body.get("password");
        Map<String, Object> person = repo.loginUser(email);
        if(person == null){
            return ResponseEntity.badRequest().body(null);
        }
        String encoded = (String)person.get("password");
        boolean match = sec.match(password, encoded);
        Integer uID = (Integer) person.get("userid");
        String token = sec.generateToken(uID.toString());
        String avatarURL = (String)person.get("avatarUrl");
        if (avatarURL == null){
            avatarURL = "";
        }
        
        if(match){
            Map<String, Object> response = Map.of(
            "token", token,
            "username", person.get("username"),
            "createdAt", person.get("createdat"),
            "avatarUrl", avatarURL
            );
            return ResponseEntity.ok(response);    
        }
        return ResponseEntity.badRequest().body(null);                    
    }
   
    
}
