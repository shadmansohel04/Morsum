package com.example.TheEats;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import com.example.TheEats.objects.Recipe;
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
import com.example.TheEats.persistence.DB;
import com.example.TheEats.persistence.S3;
import com.example.TheEats.persistence.Security;
import com.example.TheEats.persistence.StreakMS;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@CrossOrigin
@RequestMapping("/recipe")
public class RecipeController {
    
    private final S3 s3;
    private final DB repo;
    private final Security sec;
    private final StreakMS streakMS;
    
    public RecipeController(S3 s3, DB repo, Security sec, StreakMS streak){
        this.s3 = s3;
        this.repo = repo;
        this.sec = sec;
        this.streakMS = streak;
    }

    @PostMapping("/ParseRecipe")
    public ResponseEntity<Map<String,Object>> parseRecipe(@RequestBody Map<String, String> body){
        String[] steps = Recipe.parseRecipe(body.get("Recipe"));
        
        Map<String, Object> response = Map.of(
            "success", true,
            "steps", steps
        );
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/ParseIngredients")
    public ResponseEntity<Map<String,Object>> parseIngredients(@RequestBody Map<String, String> body){
        List<String> steps =  Recipe.parseIngredients(body.get("Recipe"));
        
        Map<String, Object> response = Map.of(
            "success", true,
            "ingredients", steps
        );
        
        return ResponseEntity.ok(response);
    }
        
    @PostMapping("/uploadRecipe")
    public ResponseEntity<Map<String,Object>> uploadRecipe(@RequestHeader("Authorization") String authHeader, @RequestParam("frame") MultipartFile file, @RequestParam("body") String bodyString, @RequestParam("Streak") Integer streak){
        Map<String, Object> response;
        try{
            Integer userID = sec.validateToken(authHeader);
            System.out.println("Commence Upload Recipe");
            String imgID = s3.uploadIMG(file);  
//            System.out.println(imgID);
//            response = Map.of(
//                "success", true
//            );
            
//            String imgID = "asnks";
            System.out.println("Upload Complete");         
            System.out.println(file.toString());  
            
            ObjectMapper objectMapper = new ObjectMapper();
            
            Recipe recipe = objectMapper.readValue(bodyString, Recipe.class);

            System.out.println(recipe);
            
            if(!repo.addRecipe(imgID, recipe.getIngredients(), recipe.getSteps(), recipe.getName(), userID)){
                throw new Exception("db no work");
            }
            
            response = Map.of(
                "success", true
            );
            streakMS.sendJob(userID, streak);
            return ResponseEntity.ok(response);
        }
        catch(Exception e){
            response = Map.of(
                    "success", false,
                    "eror", e.toString()
            );
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/returnRecipes")
    public ResponseEntity<Map<String,Object>> returnRecipes(@RequestHeader("Authorization") String authHeader){
        Map<String, Object> response;
        try{
            Integer id = sec.validateToken(authHeader);
            response = Map.of(
                "success", true,
                "recipes", repo.getRecipes(id)
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
    
    @GetMapping("/getMyRecipes")
    public ResponseEntity<Map<String,Object>> getMyRecipes(@RequestHeader("Authorization") String authHeader){
        Map<String, Object> response;
        try{
            Integer id = sec.validateToken(authHeader);
            response = Map.of(
                "success", true,
                "recipes", repo.getMyRecipes(id)
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
    
    @PutMapping("/swipeUpdate")
    public ResponseEntity<Map<String,Object>> updateSwipes(@RequestBody Map<String, Object> body, @RequestHeader("Authorization") String authHeader){
        Map<String, Object> response;
        try{
            Integer uID = sec.validateToken(authHeader);
            List<Map<String, Object>> tuples = (List<Map<String, Object>>) body.get("swipes");
            response = Map.of(
                "success", true,
                "recipes", repo.swipeUpdate(uID, tuples)
            );        
            return ResponseEntity.ok(response);
        }
        catch(Exception e){   
            e.printStackTrace();
            response = Map.of(
                "success", false,
                "error", "swipeFailed"
            );        
            return ResponseEntity.badRequest().body(response);
        }
        
    }
    
}
