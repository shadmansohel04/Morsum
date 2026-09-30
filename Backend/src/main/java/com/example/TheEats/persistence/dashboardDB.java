package com.example.TheEats.persistence;

import com.example.TheEats.objects.Post;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class dashboardDB {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public List<Post> getLastSpotlight(int userid) {
        String query = """
            SELECT *
            FROM post
            WHERE userid = ?
            AND showdate IS NOT NULL AND showdate <= CURRENT_DATE
            ORDER BY showdate DESC
            LIMIT 2
        """;
        try{
            return jdbcTemplate.query(query, (rs, rowNum) -> {
                List<String> badges = rs.getArray("badges") != null
                ? Arrays.asList((String[]) rs.getArray("badges").getArray())
                : List.of();

                return new Post(
                    rs.getString("caption"),
                    rs.getBoolean("homemade"),
                    rs.getString("imgurl"),
                    badges,
                    rs.getInt("stars"),
                    rs.getString("flavor"),
                    rs.getString("quant"),
                    rs.getString("time"),
                    rs.getDate("showdate").toLocalDate(),
                    rs.getInt("userid"),
                    rs.getTimestamp("createdat").toLocalDateTime()                      
                );
            }, userid);
        }
        catch(Exception e){
            return new ArrayList();
        }

    }
    
    public List<Post> getFriendPost(int userID){
        String query = 
        """
            SELECT 
                po.*,
                u.username,
                u.avatarurl
            FROM friends f
            JOIN eatsuser u 
                ON u.userID = CASE 
                    WHEN f.friend1 = ? THEN f.friend2
                    ELSE f.friend1
                END
            JOIN post po 
                ON po.userid = u.userID
            WHERE 
                (f.friend1 = ? OR f.friend2 = ?)
                AND f.accepted = true
                AND po.showdate = CURRENT_DATE;
        """;

        try{
            return jdbcTemplate.query(query, (rs, rowNum) -> {
                List<String> badges = rs.getArray("badges") != null
                ? Arrays.asList((String[]) rs.getArray("badges").getArray())
                : List.of();
                return new Post(
                    rs.getString("caption"),
                    rs.getBoolean("homemade"),
                    rs.getString("imgurl"),
                    rs.getString("avatarurl"),
                    badges, // placeholder for badges (see note below)
                    rs.getInt("stars"),
                    rs.getString("flavor"),
                    rs.getString("quant"),
                    rs.getString("time"),
                    rs.getString("username"),
                    rs.getInt("userid"),
                    rs.getTimestamp("createdat").toLocalDateTime()
                );
            }, userID, userID, userID);            
        }
        catch(Exception e){
            e.printStackTrace();
            return new ArrayList();
        }

    }
    
}
