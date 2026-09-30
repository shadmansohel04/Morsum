package com.example.TheEats;

import com.example.TheEats.objects.Post;
import com.example.TheEats.persistence.AccountDB;
import com.example.TheEats.persistence.PostDB;
import com.example.TheEats.persistence.S3;
import com.example.TheEats.persistence.Security;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
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
@RequestMapping("/Post")
public class PostController {
    
    @Autowired
    private Security sec;
    @Autowired
    private S3 s3;
    @Autowired
    private PostDB repo;
    @Autowired
    private AccountDB accountRepo;
    
    @PostMapping("/uploadPost")
    public ResponseEntity<Map<String,Object>> uploadRecipe(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("frame") MultipartFile file,
            @RequestParam("homemade") Boolean homemade,
            @RequestParam("stars") Integer stars,
            @RequestParam("caption") String caption,
            @RequestParam(value = "badges", required = false) String[] badges,
            @RequestParam("flavor") String flavor,
            @RequestParam(value = "quant", defaultValue = "-1") String quant,
            @RequestParam(value = "time", defaultValue = "-1") String time
    ){
        Map<String, Object> response;
        try{
            int userID = sec.validateToken(authHeader);
            System.out.println("Commence Upload Recipe");
            String imgID = s3.uploadIMG(file);
            System.out.println("upload complete");
            if (badges == null){
                badges = new String[0];
            }
            int inserted = repo.insertPost(caption, homemade, "https://foodimgbuck.s3.us-east-2.amazonaws.com/"+ imgID, userID, badges, stars, flavor, quant, time);
            
            if (inserted == -1){
                throw new Exception("TRANSACTION failed");
            }
            repo.changeTodayPost(userID, inserted, true);
            response = Map.of(
                "success", true
            );
            return ResponseEntity.ok(response);
        }
        catch(Exception e){
            e.printStackTrace();
            response = Map.of(
                    "success", false,
                    "eror", e.toString()
            );
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/getJars")
    public ResponseEntity<Map<String, Object>>getAllJars(@RequestHeader("Authorization") String authHeader, @RequestParam(defaultValue = "0") String offsetParam, @RequestParam(defaultValue = "false") String total){
        Map<String, Object> response = new HashMap<String, Object>();
        try{
            int userID = sec.validateToken(authHeader);
            int offset = Integer.parseInt(offsetParam);
            Map <String, Integer> jars = repo.getAllJars(userID, offset);
            response.put("jars", jars);
            if(total.equalsIgnoreCase("true")){
                int totalCount = repo.getAllPostsCount(userID);
                response.put("total", totalCount);
            }
            return ResponseEntity.ok(response);
        }
        catch(Exception e){
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/getPostsMonth")
    public ResponseEntity<List<Post>>getPostsMonth(@RequestHeader("Authorization") String authHeader, @RequestParam String monthYear){
        try{
            int userID = sec.validateToken(authHeader);
            return ResponseEntity.ok(repo.getAllPostsMonth(userID, monthYear));
        }
        catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PostMapping("/getPostReactions")
    public ResponseEntity<Map<String, Object>>getPostReactions(@RequestHeader("Authorization") String authHeader,  @RequestBody Map<String, String> body){
        Map<String, Object> response = new HashMap<String, Object>();
        try{
            int userID = sec.validateToken(authHeader);
            String showdate = body.get("showdate");
            List all = repo.getPostReactions(userID, showdate);
            List first = all.subList(0, Math.min(all.size(), 4));
            response.put("allreactions", all);
            response.put("first", first);
            return ResponseEntity.ok(response);
        }
        catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PutMapping("/makeReaction")
    public ResponseEntity makeReaction(@RequestHeader("Authorization") String authHeader,  @RequestBody Map<String, Object> body){
        try{
            String username = (String) body.get("username");
            int rating = (int) body.get("rating");
            int userID = sec.validateToken(authHeader);
            if (rating < 0 || rating > 10){
                throw new Exception("failed rating");
            }
            if (username.isBlank() || username.isEmpty()){
                throw new Exception("empty user");
            }
            if (!repo.insertReaction(username, userID, rating)){
                throw new Exception("SQL Failed");
            }
            return ResponseEntity.ok(Map.of("success", true));
        }
        catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/getAllSpotLights")
    public ResponseEntity<Map<String, Object>> getAllSpotlight(
            @RequestHeader("Authorization") String authHeader, 
            @RequestParam(defaultValue = "0") String offsetParam, 
            @RequestParam(defaultValue = "false") String firstPull) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            int userID = sec.validateToken(authHeader);
            int offset = Integer.parseInt(offsetParam);
            
            Map<String, List<List<Object>>> allSpotlightData = repo.getAllSpotlight(userID, offset);
            response.put("spotlightData", allSpotlightData);
            
            if (firstPull.equalsIgnoreCase("true")) {
                response.put("totalSpotlight", repo.getAllSpotlightCount(userID));
                response.put("totalStreak", repo.getStreak(userID));
                response.put("friendCount", accountRepo.getFriendCount(userID));
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    
    @GetMapping("/getChoosePosts")
    public ResponseEntity<Map<String,Object>> uploadRecipe(@RequestHeader("Authorization") String authHeader){
        Map<String, Object> response;
        try{
            int userID = sec.validateToken(authHeader);
            return ResponseEntity.ok(repo.getChoosePostData(userID));
        }
        catch(Exception e){
            System.out.println(e.toString());
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PutMapping("/changeSpotlight")
    public ResponseEntity<Map<String,Object>> changeSpotlight(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, Integer> body){
        Map<String, Object> response;
        try{
            int userID = sec.validateToken(authHeader);
            int postID = body.get("postID");
            repo.changeTodayPost(userID, postID, false);
            response = Map.of(
                "success", true
            );
            return ResponseEntity.ok(response);
        }
        catch(Exception e){
            System.out.println(e.toString());
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @GetMapping("/getTodayStatus")
    public ResponseEntity<Map<String,Object>> getTodayStatus(@RequestHeader("Authorization") String authHeader){
        Map<String, Object> response;
        try{
            int userID = sec.validateToken(authHeader);
            List<?> allPosts = (List<?>) repo.getChoosePostData(userID).get("allPosts");
            boolean valid = allPosts != null && !allPosts.isEmpty();
            response = Map.of(
                "success", valid
            );
            return ResponseEntity.ok(response);
        }
        catch(Exception e){
            System.out.println(e.toString());
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @DeleteMapping("/deletePost")
    public ResponseEntity<Map<String,Object>> deletePost(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, Integer> body){
        Map<String, Object> response;
        try{
            int userID = sec.validateToken(authHeader);
            int postID = body.get("postID");
            
            String imgurl = repo.deletePost(userID, postID);
            if (imgurl != null && imgurl.contains("/")) {
                s3.deleteIMG(imgurl); 
            }
            
            response = Map.of(
                "success", true
            );
            return ResponseEntity.ok(response);
        }
        catch(Exception e){
            System.out.println(e.toString());
            response = Map.of(
                "success", false,
                "error", e.toString()
            );
            return ResponseEntity.badRequest().body(response);
        }
    }
    
}
