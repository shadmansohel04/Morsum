package com.example.TheEats;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.example.TheEats.persistence.S3;
import com.example.TheEats.persistence.Security;
import com.example.TheEats.persistence.StreakMS;
import com.example.TheEats.persistence.dashDB;
import java.util.ArrayList;
import java.util.HashMap;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@CrossOrigin
@RequestMapping("/dashboard")
public class DashController {
    
    private final S3 s3;
    private final dashDB repo;
    private final Security sec;
    private final StreakMS streakMS;
    
    public DashController(S3 s3, dashDB repo, Security sec, StreakMS streak){
        this.s3 = s3;
        this.repo = repo;
        this.sec = sec;
        this.streakMS = streak;
    }
    
    @PostMapping("/getFriendPostInfo")
    public ResponseEntity<Map<String,Object>> getSinglePost(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, Integer> body){
        Map<String, Object> response;
        try{
            Integer userID = sec.validateToken(authHeader);
            Integer postID = body.get("postID");
            Integer posterID = body.get("posterID");
            if (userID == posterID){
                throw new Exception("Finding own post(wrong route)");
            }
            int friend1 = Integer.max(userID, posterID);
            int friend2 = Integer.min(userID, posterID);

            response = Map.of(
                "info", repo.getPostInfo(postID, posterID, friend1, friend2)
            );
            return ResponseEntity.ok(response);
        }
        catch(Exception e){
            response = Map.of(
                "success", false,
                    "error", e.toString()
            );
            return ResponseEntity.internalServerError().body(response);        
        }        
    }
    
    @PutMapping("/changeSpotlight")
    public ResponseEntity<Map<String,Object>> updateSpotlight(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, Integer> body){
        Map<String, Object> response;
        try{
            Integer id = sec.validateToken(authHeader);
            Integer postID = body.get("postID");
            response = Map.of(
                "success", repo.updateSpotlight(id, postID)
            );
            return ResponseEntity.ok(response);
        }
        catch(Exception e){
            response = Map.of(
                "success", false,
                    "error", e.toString()
            );
            return ResponseEntity.internalServerError().body(response);        
        }
    }
    
    @GetMapping("/dailyPosts")
    public ResponseEntity<Map<String,Object>> returnDaily(@RequestHeader("Authorization") String authHeader){
        Map<String, Object> response;
        try{
            Integer id = sec.validateToken(authHeader);
            
            List<Map<String, Object>> friendsPost = null;
            Map<String, Object> myself = null;
            try{
                friendsPost = repo.getFriends(id);   
            }
            catch(Exception e){
                friendsPost = new ArrayList();
            }
           
            try{
                myself = repo.getMyDaily(id);
            }
            catch(Exception e){
                myself = new HashMap();                
            }
            
            response = Map.of(
                "success", true,
                "myself", myself,
                "friends", friendsPost
            );
            return ResponseEntity.ok(response);
        }
        catch(Exception e){
            response = Map.of(
                "success", false,
                    "error", e.toString()
            );
            return ResponseEntity.internalServerError().body(response);        
        }
    }
    
}
