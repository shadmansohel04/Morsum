package com.example.TheEats.persistence;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;
@Repository
public class dashDB {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> getPostInfo(int postID, int posterID, int friend1, int friend2) throws Exception {
        String query = "SELECT\n" +
                        "    po.postid,\n" +
                        "    po.foodname,\n" +
                        "    po.homemade\n" +
                        "FROM posts po\n" +
                        "WHERE po.postid = ?\n" +
                        "AND po.userid = ?\n" +
                        "	AND EXISTS (\n" +
                        "        SELECT 1\n" +
                        "        FROM friends f\n" +
                        "        WHERE (f.friend1 = ? AND f.friend2 = ?)\n" +
                        "    );";
        Map<String, Object> postInfo = null;
        try{
            postInfo = jdbcTemplate.queryForMap(query, postID, posterID, friend1, friend2);
            if (postInfo.isEmpty()){
                throw new Exception("EMPTY RETURN IN GETPOST");
            }
            return postInfo;
        }
        catch(Exception e){
            e.printStackTrace();
            throw new Exception("SQL fail for getPostInfo");
        }
        
    }
    
    public Map<String, Object> getMyDaily(int userID) throws Exception {
        try{
            String query = "SELECT\n" +
                        "	u.postid as spotLight,\n" +
                        "	po.postid,\n" +
                        "	po.foodname,\n" +
                        "	po.created_at as time,\n" +
                        "	po.homemade,\n" +
                        "	po.imgurl as image\n" +
                        "FROM eatsuser u\n" +
                        "JOIN posts po ON u.userid = po.userid\n" +
                        "WHERE u.userid = ?\n" +
                        "AND po.created_at >= (CURRENT_DATE - INTERVAL '1 day') AND po.created_at <  CURRENT_DATE;";   
            Map<String, Object> toReturn = new HashMap<>();
            final int[] spotLight = { -1 };
            
            List<Map<String, Object>> allPosts = jdbcTemplate.query(query,
                new Object[]{userID},
                (rs, rowNum) -> {
                    if (spotLight[0] == -1){
                        spotLight[0] = rs.getInt("spotLight");
                    }
                    Map<String, Object> row = new HashMap<>();
                    row.put("postID", rs.getInt("postid"));
                    row.put("foodname", rs.getString("foodname"));
                    row.put("time", rs.getTime("time"));
                    row.put("homemade", rs.getBoolean("homemade"));
                    row.put("imgurl", "https://foodimgbuck.s3.us-east-2.amazonaws.com/" + rs.getString("image"));
                    return row;
                });
            
            if (allPosts.size() == 0){
                throw new Exception("no posts");
            }
            
            toReturn.put("allPosts", allPosts);
            toReturn.put("spotLight", spotLight[0]);
            
            return toReturn;
        }
        catch(Exception e){
            throw new Exception("DB failure for getToday");
        }

    }
    
    public boolean updateSpotlight(int userID, int postID) throws Exception{
        String query = "UPDATE eatsuser SET postid = ? WHERE userid = ?;";
        try{
            return jdbcTemplate.update(query, postID, userID) == 1;
        }
        catch(Exception e){
            throw new Exception("update spotlight failed DB");
        }
    }
    
    public List<Map<String, Object>> getFriends(int userID) throws Exception {
        try{
            String query = "SELECT \n" +
                        "	u.userid as friend_ID,\n" +
                        "	u.profile,\n" +
                        "	u.username,\n" +
                        "	u.streak,\n" +
                        "	po.imgurl as image,\n" +
                        "	po.foodname,\n" +
                        "	po.homemade,\n" +
                        "	po.created_at,\n" +
                        "	po.postid\n" +
                        "FROM friends f\n" +
                        "JOIN eatsuser u ON (f.friend2 = u.userID OR f.friend1 = u.userID)\n" +
                        "JOIN posts po ON  u.userid = po.userid\n" +
                        "WHERE u.userID != ? \n" +
                        "	AND ((f.friend1 = ? OR f.friend2 = ?) AND f.accepted = true)\n" +
                        "	AND po.created_at >= (CURRENT_DATE - INTERVAL '1 day') AND po.created_at <  CURRENT_DATE\n" +
                        "	AND po.postid = u.postid;";

            return jdbcTemplate.query(query,
                new Object[]{userID, userID, userID},
                (rs, rowNum) -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("friend_id", rs.getInt("friend_id"));
                    row.put("postID", rs.getInt("postid"));
                    row.put("username", rs.getString("username"));
                    row.put("streak", rs.getInt("streak"));                
                    String raw = rs.getString("profile");

                    JsonNode profileJsonNode;
                    try {
                        profileJsonNode = objectMapper.readTree(raw);
                    } catch (Exception e) {
                        profileJsonNode = null;
                    }
                    row.put("profile", profileJsonNode);

                    row.put("imgurl", "https://foodimgbuck.s3.us-east-2.amazonaws.com/" + rs.getString("image"));
                    row.put("foodname", rs.getString("foodname"));
                    return row;
                });            
        }
        catch(Exception e){
            throw new Exception("DB failure for getFriends");
        }

    }

}
