package com.example.TheEats;

import com.example.TheEats.business.Business;
import com.example.TheEats.objects.Post;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.TheEats.persistence.Security;
import com.example.TheEats.persistence.dashboardDB;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@CrossOrigin
@RequestMapping("/dash")
public class DashboardController {
    
    @Autowired
    private dashboardDB repo;
    @Autowired
    private Security sec;
    @Autowired
    private Business business;
    
    @GetMapping("/getDashboardData")
    public ResponseEntity<Map<String,Object>> getDashboard(@RequestHeader("Authorization") String authHeader){
        try{
            Integer userID = sec.validateToken(authHeader);
            return ResponseEntity.ok(business.getDashboard(userID));
        }
        catch(Exception e){
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", e.toString()
            ));        
        }        
    }
    
}
