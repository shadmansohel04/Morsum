
package com.example.TheEats.business;

import com.example.TheEats.objects.Post;
import com.example.TheEats.persistence.dashboardDB;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class Business {
    
    @Autowired
    private dashboardDB repo;
    
    public Map<String, Object> getDashboard(int userID) throws Exception{
        List<Post> last2 = repo.getLastSpotlight(userID);
        List<Post> friendSpotlights = repo.getFriendPost(userID);
        LocalDate yesterday = LocalDate.now(ZoneOffset.UTC);
        Map<String, Object> response = new HashMap<>();

        for (Post recent: last2){
            if (recent.getDate().equals(yesterday)){
                recent.setActive(true);
                response.put("spotlight", recent);
                break;
            }
        }
        if (!response.containsKey("spotlight") && last2.size() > 0){
            response.put("spotlight", last2.get(0));
        }
        response.put("friends", friendSpotlights);
        return response;
    }
    
}
