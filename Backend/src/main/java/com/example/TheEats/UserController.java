package com.example.TheEats;

import com.example.TheEats.objects.Attempt;
import com.example.TheEats.objects.ChatMessage;
import com.example.TheEats.objects.MessageType;
import com.example.TheEats.persistence.DB;
import com.example.TheEats.business.PushMS;
import com.example.TheEats.persistence.S3;
import com.example.TheEats.persistence.Security;
import com.example.TheEats.persistence.StreakMS;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
@RequestMapping("/user")
public class UserController {
    
    private final DB repo;
    private final Security sec;
    private final S3 s3;
    private final StreakMS streakMS;
    private final SimpMessageSendingOperations messageTemplate;
    private final PushMS push;
    
    public UserController(PushMS push, DB repo, Security sec, S3 s3, StreakMS streakMS, SimpMessageSendingOperations messageTemp){
        this.repo = repo;
        this.sec = sec;
        this.s3 = s3;
        this.streakMS = streakMS;
        this.messageTemplate = messageTemp;
        this.push = push;
    }

    @PostMapping("/createAccount")
    public ResponseEntity<Map<String,Object>> createAccount(@RequestBody Map<String, String> body){
        String email = body.get("email");
        String firstName = body.get("firstName");
        String lastName = body.get("lastName");
        String password = body.get("password");
        String userName = body.get("userName");
        
        try{
            if(email.isEmpty() || !email.contains("@") || !email.contains(".")){
                throw new Exception("invalid email");
            }
            
            if(firstName.isEmpty() || lastName.isEmpty() || userName.isEmpty()){
                throw new Exception("invalid name");
            }
            
            if(password.isEmpty() || password.length() < 6){
                throw new Exception("invalid password");
            }
            
            String encoded = this.sec.hashPassword(password);
            
            if(!repo.createUser(email, encoded, firstName, lastName, userName)){
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
        if(fromToken != null){
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
    
    @PostMapping("/loginAccount")
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
        
        if(match){
            Map<String, Object> response = Map.of(
            "token", token
            );
            return ResponseEntity.ok(response);    
        }
        return ResponseEntity.badRequest().body(null);                    
    }
    
    @PostMapping("/uploadAttempt")
    public ResponseEntity<Map<String,Object>> uploadAttempt(@RequestHeader("Authorization") String authHeader, @RequestParam(value = "frame", required = false) MultipartFile file, @RequestParam("body") String bodyString){
        Map<String, Object> response;
        try{
            Integer userID = sec.validateToken(authHeader);
            String imgID = "default";
            if(file != null){
                imgID = s3.uploadIMG(file);
                streakMS.sendJob(userID, 0);
            }
            ObjectMapper objectMapper = new ObjectMapper();
            
            Attempt attempt = objectMapper.readValue(bodyString, Attempt.class);
            
            repo.addAttempt(userID, attempt.getRecipeID(), attempt.getTaste(), attempt.getEase(), attempt.getAccuracy(), imgID);
            
            response = Map.of(
            "success", true
            );
            return ResponseEntity.ok(response);
        }
        catch(Exception e){
            response = Map.of(
                "success", false,
                "error", e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @DeleteMapping("/removeLocation")
    public ResponseEntity<Map<String,Object>> removeLocation(@RequestHeader("Authorization") String authHeader){
        Map<String, Object> response;
        try{
            Integer userID = sec.validateToken(authHeader);
            if(!repo.clearLocation(userID)){
                throw new Error("Failed to delete");
            }
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

    
    @PutMapping("/updateLocation")
    public ResponseEntity<Map<String,Object>> updateLocation(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> body){
        Map<String, Object> response;
        try{
            Double longitude = Double.parseDouble(body.get("longitude"));
            Double latitude = Double.parseDouble(body.get("latitude"));
            Integer userID = sec.validateToken(authHeader);            
            repo.updateLocation(longitude, latitude, userID);
            
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
    
    @PostMapping("/freindRequest")
    public ResponseEntity<Map<String,Object>> freindRequest(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> body){
        Map<String, Object> response;
        try{
            Integer userID = sec.validateToken(authHeader);
            String friendUserName = body.get("username");
            repo.freindRequest(userID, friendUserName);
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
    
    @DeleteMapping("/deleteFriend")
    public ResponseEntity<Map<String,Object>> deleteFriend(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> body){
        Map<String, Object> response;
        try{
            Integer userID = sec.validateToken(authHeader);
            Integer friendID = Integer.parseInt(body.get("friendID"));
            boolean pending = Boolean.parseBoolean(body.get("pending"));
            
            repo.deleteFriend(userID, friendID, pending);
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
    
    @PostMapping("/acceptFriend")
    public ResponseEntity<Map<String,Object>> acceptFriend(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> body){
        Map<String, Object> response;
        try{
            Integer userID = sec.validateToken(authHeader);
            Integer friendID = Integer.parseInt(body.get("friendID"));
            
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
        
    @GetMapping("/getFreinds")
    public ResponseEntity<Map<String,Object>> getFreinds(@RequestHeader("Authorization") String authHeader){
        Map<String, Object> response;
        try{
            Integer userID = sec.validateToken(authHeader);
            response = Map.of(
            "success", true,
                "freinds", repo.getFriends(userID)
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
    
    @GetMapping("/getTopChats")
    public ResponseEntity<Map<String,Object>> getChats(@RequestHeader("Authorization") String authHeader){
        Map<String, Object> response;
        try{
            Integer userID = sec.validateToken(authHeader);
            response = Map.of(
            "success", true,
                "freinds", repo.getTopMessages(userID)
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
    
    @GetMapping("/getPending")
    public ResponseEntity<Map<String,Object>> getPending(@RequestHeader("Authorization") String authHeader){
        Map<String, Object> response;
        try{
            Integer userID = sec.validateToken(authHeader);
            response = Map.of(
            "success", true,
                "freinds", repo.getPending(userID)
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
    
    @PutMapping("/updateProfile")
    public ResponseEntity<Map<String,Object>> updateProfile(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, Object> body){
        Map<String, Object> response;
        try{
            Integer userID = sec.validateToken(authHeader);
            repo.updateProfile(body, userID);
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
    
    @GetMapping("/getProfile")
    public ResponseEntity<Map<String,Object>> updateProfile(@RequestHeader("Authorization") String authHeader){
        Map<String, Object> response;
        try{
            Integer userID = sec.validateToken(authHeader);
            Map<String, Object> profile = repo.getProfile(userID);
            response = Map.of(
            "success", true,
            "profile", profile
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
    public ResponseEntity<Map<String,Object>> findPeople(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, Object> body){
        Map<String, Object> response;
        try{
            Integer userID = sec.validateToken(authHeader);
            String text = (String) body.get("search");
            response = Map.of(
            "success", true,
            "profile", repo.findPeople(userID, text)
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
    
    @PostMapping("/createChat")
    public ResponseEntity<Map<String,Object>> createChat(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> body){
        Map<String, Object> response;
        try{
            Integer userID = sec.validateToken(authHeader);
            Integer friendID = Integer.parseInt(body.get("friendID"));
            int big = userID > friendID? userID: friendID;
            int small = big == userID? friendID: userID;
            String roomID = "" + big + ":" + small;

            repo.createChat(userID, friendID);
            response = Map.of(
            "success", true,
            "roomID", roomID
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
    
    @PostMapping("/insertRecipeMessage")
    public ResponseEntity<Map<String,Object>> addRecipeMessage(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, Object> body){
        Map<String, Object> response;
        try{
            System.out.println("BEGIN");
            Integer userID = sec.validateToken(authHeader);
            
            String username = (String) body.get("username");
            Map profile = (Map) body.get("person");
            Map recipe = (Map) body.get("recipe");
            
            int recipientID = (int) profile.get("friend_id");
            String roomID = userID > recipientID? "" + userID + ":" + recipientID: "" + recipientID + ":" + userID;
            String content = (String) recipe.get("recipeName") + "^^vv" + (int) recipe.get("recipeID") + "^^vv" + (String) recipe.get("imgurl");            
            
            try{
                repo.createChat(userID, recipientID);
            }
            catch(Exception e){
                System.out.println("already exits");
            }

            ChatMessage message = ChatMessage.builder()
                .content(content)
                .sender(username)
                .type(MessageType.CHAT)
                .build();
            
            messageTemplate.convertAndSend("/topic/room/" + roomID, message);
            repo.insertMessage(userID, roomID, content, true);
            push.sendExpoPush(username, content, roomID);

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

    @GetMapping("/getPreviousMessages/{roomID}")
    public ResponseEntity<Map<String,Object>> getPreviousMessages(@RequestHeader("Authorization") String authHeader, @PathVariable("roomID") String roomID){
        Map<String, Object> response;
        try{
            Integer userID = sec.validateToken(authHeader);
            sec.validateChat(roomID, userID);
            response = Map.of(
            "success", true,
            "chats", repo.getChats(roomID, userID)
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

    
}
