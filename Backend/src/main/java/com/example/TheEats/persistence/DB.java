package com.example.TheEats.persistence;

import com.fasterxml.jackson.core.JsonProcessingException;
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
public class DB {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public List<Map<String, Object>> getLiked(int id){
        String sql = "SELECT\n" +
                     "    rec.recipeName,\n" +
                     "    rec.ingredients::text,\n" +
                     "    rec.steps::text,\n" +
                     "    rec.imgurl,\n" +
                     "    rec.recipeID\n" +
                     "FROM recipe rec\n" +
                     "JOIN swipe swi ON swi.recipeid = rec.recipeid\n" +
                     "JOIN eatsuser you ON you.userid = swi.userid\n" +
                     "WHERE you.userid = ?\n" +
                     "AND swi.action = 'like'\n" +
                     "LIMIT 100;";

                
        return jdbcTemplate.query(sql, 
            new Object[] {id}, 
            (rs, rownum)->{
            Map<String, Object> row = new HashMap<>();
            row.put("recipeID",(Integer) rs.getInt("recipeID"));
            row.put("recipeName", rs.getString("recipeName"));
            row.put("imgurl", "https://foodimgbuck.s3.us-east-2.amazonaws.com/" + rs.getString("imgurl"));
            
            ObjectMapper objectMapper = new ObjectMapper();
            try{
                String ingredientsJson = rs.getString("ingredients");
                String stepsJson = rs.getString("steps");
                
                List<String> ingredients = objectMapper.readValue(ingredientsJson, List.class);
                List<String> steps = objectMapper.readValue(stepsJson, List.class);

                row.put("ingredients", ingredients);
                row.put("steps", steps);
            }
            catch(Exception e){
                System.out.println("err in getLiked");
                throw new RuntimeException("Error in DB");
            }
            return row;
        });   
    }

    public List<Map<String, Object>> getRecipes(int id) {

        String sql = "SELECT \n" +
                    "    rec.recipeName, \n" +
                    "    rec.ingredients::text, \n" +
                    "    rec.steps::text, \n" +
                    "    rec.imgurl, \n" +
                    "    rec.recipeID, \n" +
                    "    cook.userName\n" +
                    "FROM \n" +
                    "    recipe rec\n" +
                    "JOIN eatsuser cook ON cook.userID = rec.userID\n" +
                    "WHERE NOT EXISTS (\n" +
                    "    SELECT 1 \n" +
                    "    FROM Swipe swipe\n" +
                    "    JOIN eatsUser e ON e.userID = swipe.userID\n" +
                    "    WHERE e.userID = ?\n" +
                    "      AND swipe.recipeID = rec.recipeID\n" +
                    ")\n" +
                    "ORDER BY RANDOM()" + 
                    "LIMIT 15;";

        return jdbcTemplate.query(sql,
            new Object[] {id},
            (rs, rowNum) -> {
                
                Map<String, Object> row = new HashMap<>();
                row.put("recipeID",(Integer) rs.getInt("recipeID"));
                row.put("recipeName", rs.getString("recipeName"));
                row.put("imgurl", "https://foodimgbuck.s3.us-east-2.amazonaws.com/" + rs.getString("imgurl"));

                ObjectMapper objectMapper = new ObjectMapper();

                try {
                    String ingredientsJson = rs.getString("ingredients");
                    String stepsJson = rs.getString("steps");

                    List<String> ingredients = objectMapper.readValue(ingredientsJson, List.class);
                    List<String> steps = objectMapper.readValue(stepsJson, List.class);

                    row.put("ingredients", ingredients);
                    row.put("steps", steps);
                } catch (Exception e) {
                    System.out.println("asss");
                    throw new RuntimeException("Failed to parse JSON fields", e);
                }
                return row;
        });
    }

    public boolean addRecipe(String imgURL, String[] ingredients, String[] steps, String recipeName, int userID) {
        System.out.println("ADDING RECIPE");

        String sql = "INSERT INTO Recipe (recipeName, ingredients, steps, imgURL, userID) " +
                     "VALUES (?, ?::jsonb, ?::jsonb, ?, ?) RETURNING recipeID;";

        String sql2 = "INSERT INTO attempt (recipeID, userID, taste, accuracy, ease, attemptIMG) " +
                      "VALUES (?, ?, ?, ?, ?, ?);";

        try {
            String ingredientsJson = objectMapper.writeValueAsString(ingredients);
            String stepsJson = objectMapper.writeValueAsString(steps);

            int recipeID = jdbcTemplate.queryForObject(sql, new Object[]{
                recipeName,
                ingredientsJson,
                stepsJson,
                imgURL,
                userID
            }, Integer.class);

            jdbcTemplate.update(sql2, recipeID, userID, 5, 5, 5, imgURL);

            return true;
        } catch (Exception err) {
            System.out.println("Error in adding recipe or attempt to the db: " + err.getMessage());
            return false;
        }
    }

    public boolean clearLocation(int uID){
        String sql = "UPDATE eatsuser\n" +
                    "SET latitude = NULL,\n" +
                    "    longitude = NULL\n" +
                    "WHERE userid = ?;";
        int count = jdbcTemplate.update(sql, uID);
        return count == 1;
    }
    
    public List<Map<String, Object>> swipeUpdate(int uID, List<Map<String, Object>> tuples){
        String sql = "INSERT INTO Swipe(userID, recipeID, action) VALUES (?, ?, ?)";
        List<Object[]> batchArgs = new ArrayList<>();
        for (Map<String, Object> tuple : tuples) {
            batchArgs.add(new Object[] {
                uID,
                (int)tuple.get("recipeID"),
                (String)tuple.get("action")
            });
        }
        try{
           jdbcTemplate.batchUpdate(sql, batchArgs);            
        }
        catch(Exception e){
            System.out.println(e.getMessage());
        }
        
        return getRecipes(uID);
    }
    
    public boolean removeLiked(int recipeID, int userID){
        String query = "DELETE FROM swipe WHERE userid = ? AND recipeid = ? AND action = 'like';";
    
        try{
            Integer inst = jdbcTemplate.update(query, userID, recipeID);
            if(inst != 1){
                System.out.println("not exist");
                return false;
            }
            return true;
        }
        catch(Exception e){
            System.out.println("remove liked failed");
            return false;
        }
    }
    
    public List<Map<String, Object>> getMyRecipes(int userID){
        String sql = "SELECT\n" +
                     "    rec.recipeName,\n" +
                     "    rec.ingredients::text,\n" +
                     "    rec.steps::text,\n" +
                     "    swi.attemptimg,\n" +
                     "    rec.recipeID,\n" +
                     "    swi.created_at\n" +
                     "FROM recipe rec\n" +
                     "JOIN attempt swi ON swi.recipeid = rec.recipeid\n" +
                     "JOIN eatsuser you ON you.userid = swi.userid\n" +
                     "WHERE you.userid = ?\n" +
                     "ORDER BY swi.created_at DESC\n" +
                     "LIMIT 100;";

                
        return jdbcTemplate.query(sql, 
            new Object[] {userID}, 
            (rs, rownum)->{
            Map<String, Object> row = new HashMap<>();
            row.put("recipeID",(Integer) rs.getInt("recipeID"));
            row.put("recipeName", rs.getString("recipeName"));
            row.put("imgurl", "https://foodimgbuck.s3.us-east-2.amazonaws.com/" + rs.getString("attemptimg"));
            row.put("date", rs.getString("created_at"));

            
            ObjectMapper objectMapper = new ObjectMapper();
            try{
                String ingredientsJson = rs.getString("ingredients");
                String stepsJson = rs.getString("steps");
                
                List<String> ingredients = objectMapper.readValue(ingredientsJson, List.class);
                List<String> steps = objectMapper.readValue(stepsJson, List.class);

                row.put("ingredients", ingredients);
                row.put("steps", steps);
            }
            catch(Exception e){
                System.out.println("err in getLiked");
                throw new RuntimeException("Error in DB");
            }
            return row;
        });    
    }
    
    
    
    public boolean createUser(String email, String hashed, String first, String last, String username){
        try{
            String query = "INSERT INTO eatsuser(email, firstname, lastname, username, password) VALUES (?, ?, ?, ?, ?);";
            jdbcTemplate.update(query, email, first, last, username, hashed);
            return true;
        }
        catch(Exception e){
            e.printStackTrace();
            return false;
        }
    }
    
    public Map<String, Object> loginUser(String email){
        String query = "SELECT userid, password FROM eatsuser WHERE email = ?";
        try{
            Map<String, Object> person = jdbcTemplate.queryForMap(query, email);
            return person;
        }
        catch (Exception e){
            return null;
        }
    }
    
    public void addAttempt(int userID, int recipeID, int taste, int ease, int accuracy, String imgURI) throws Exception{
        String command = "INSERT INTO attempt(recipeID, userID, taste, accuracy, ease, attemptIMG) VALUES(?, ?, ?, ?, ?, ?);";
        int response = jdbcTemplate.update(command, recipeID, userID, taste, accuracy, ease, imgURI);
        if(response < 0){
            throw new Exception("add attempt failed");
        }
    }
    
    public void updateLocation(double longitude, double latitude, int userID) throws Exception{
        String update = "UPDATE eatsuser SET latitude = ?, longitude = ? WHERE userid = ?;";
        int response = jdbcTemplate.update(update, latitude, longitude, userID);
        if(response != 1){
            throw new Exception("failed to update location");
        }
    }
    
    public void updateNotificationToken(int userID, String token) throws Exception{
        String update = "UPDATE eatsuser SET notificationid = ? where userid = ?";
        int response = jdbcTemplate.update(update, token, userID);
        if(response != 1){
            throw new Exception("failed to update pushToken");
  
        }
    }
    
    public void freindRequest(int userID, String friendUserName) throws Exception{
        String update = "INSERT INTO friends(friend1, friend2, requested) " +
                        "VALUES( " +
                        "GREATEST(?, (SELECT userID FROM eatsuser WHERE username = ? LIMIT 1))," +
                        "LEAST(?, (SELECT userID FROM eatsuser WHERE username = ? LIMIT 1))," +
                        "?" +
                        ");";
        int response = jdbcTemplate.update(update, userID, friendUserName, userID, friendUserName, userID);
        if(response != 1){
            throw new Exception("failed to update location");
        }
    }
    
    public void deleteFriend(int userID, int friendID, boolean pending) throws Exception{
        int big = userID > friendID ? userID: friendID;
        int small = big == userID? friendID: userID;
        
        String update = pending ? "DELETE FROM friends WHERE friend1 = ? AND friend2 = ? AND accepted = false;": "DELETE FROM friends WHERE friend1 = ? AND friend2 = ? AND accepted = true;";
        int response = jdbcTemplate.update(update, big, small);
        if(response != 1){
            throw new Exception("failed to delete friend");
        }
    }
    
    public void acceptFriend(int userID, int friendID) throws Exception{
        int big = userID > friendID ? userID: friendID;
        int small = big == userID? friendID: userID;
        
        String update = "UPDATE friends SET accepted = true WHERE friend1 = ? AND friend2 = ? AND accepted = false;";
        int response = jdbcTemplate.update(update, big, small);
        if(response != 1){
            throw new Exception("failed to accept friend");
        }
    }

    public List<Map<String, Object>> getFriends(int userID) throws Exception {
        
        String query = "SELECT " +
                        "u.userID AS friend_id, " +
                        "u.profile, " +
                        "u.username, " +
                        "u.latitude, " +
                        "u.longitude, " +
                        "u.streak," +
                        "la.attemptimg, " +
                        "la.taste, " +
                        "la.accuracy, " +
                        "la.ease, " +
                        "la.imgurl, " +
                        "la.recipename, " +
                        "la.recipeid " +
                        "FROM friends f " +
                        "JOIN eatsuser u ON (f.friend2 = u.userID OR f.friend1 = u.userID) " +
                        "LEFT JOIN ( " +
                        "  SELECT a.userid, a.attemptimg, a.taste, a.accuracy, a.ease, a.recipeid, r.imgurl, r.recipename " +
                        "  FROM ( " +
                        "    SELECT *, ROW_NUMBER() OVER (PARTITION BY userid ORDER BY attemptid DESC) as rn " +
                        "    FROM attempt " +
                        "  ) a " +
                        "  JOIN recipe r ON a.recipeid = r.recipeid " +
                        "  WHERE a.rn = 1 " +
                        ") la ON la.userid = u.userID " +
                        "WHERE u.userID != ? " +
                        "AND ((f.friend1 = ? OR f.friend2 = ?) AND f.accepted = true) " +
                        "LIMIT 15;";

        return jdbcTemplate.query(query,
            new Object[]{userID, userID, userID},
            (rs, rowNum) -> {
                Map<String, Object> row = new HashMap<>();
                row.put("friend_id", rs.getInt("friend_id"));
                row.put("recipeID", rs.getObject("recipeid") != null ? rs.getInt("recipeid") : null);
                row.put("username", rs.getString("username"));
                row.put("streak", rs.getInt("streak"));
                
                Double lat = rs.getObject("latitude") != null ? rs.getDouble("latitude") : null;
                Double lon = rs.getObject("longitude") != null ? rs.getDouble("longitude") : null;
                String raw = rs.getString("profile");

                JsonNode profileJsonNode;
                try {
                    profileJsonNode = objectMapper.readTree(raw);
                } catch (Exception e) {
                    profileJsonNode = null;
                }

                row.put("longitude", lon);
                row.put("latitude", lat);
                row.put("profile", profileJsonNode);

                // Always add attempt-related fields, no null check
                row.put("attemptimg", "https://foodimgbuck.s3.us-east-2.amazonaws.com/" + rs.getString("attemptimg"));
                row.put("imgurl", "https://foodimgbuck.s3.us-east-2.amazonaws.com/" + rs.getString("imgurl"));
                row.put("recipename", rs.getString("recipename"));
                row.put("taste", rs.getObject("taste") != null ? rs.getInt("taste") : null);
                row.put("accuracy", rs.getObject("accuracy") != null ? rs.getInt("accuracy") : null);
                row.put("ease", rs.getObject("ease") != null ? rs.getInt("ease") : null);

                return row;
            });
    }

    public List<Map<String, Object>> getPending(int userID) throws Exception {
        String query = "SELECT DISTINCT CASE WHEN f.friend1 = ? THEN f.friend2 ELSE f.friend1 END AS friend_id, u.profile, u.username, f.requested " +
                    "FROM friends f " +
                    "JOIN eatsuser u ON (f.friend2 = u.userID OR f.friend1 = u.userID) " +
                    "WHERE ((f.friend1 = ? OR f.friend2 = ?) AND f.accepted = false AND u.userID != ?)";

        return jdbcTemplate.query(query,
            new Object[]{userID, userID, userID, userID},
            (rs, rowNum) -> {
                Map<String, Object> row = new HashMap<>();
                row.put("friend_id", rs.getInt("friend_id"));
                row.put("username", rs.getString("username"));
                row.put("requested", rs.getInt("requested"));

                String raw = rs.getString("profile");
                JsonNode profileJsonNode;
                try {
                    profileJsonNode = objectMapper.readTree(raw);
                } catch (Exception e) {
                    profileJsonNode = null;  // Gracefully handle the case when parsing fails
                }
                row.put("profile", profileJsonNode);
                return row;
            });
    }
    
    public void updateProfile(Map<String, Object> profile, Integer userID) throws JsonProcessingException {
        String update = "UPDATE eatsuser SET profile = ?::jsonb WHERE userID = ?";

        ObjectMapper objectMapper = new ObjectMapper();
        String jsonString = objectMapper.writeValueAsString(profile);

        int effect = jdbcTemplate.update(update, jsonString, userID);

        if (effect != 1) {
            throw new Error("error in update profile");
        }
    }
    
    public void createChat(int userID, int friendID) throws Error {
        String update = "INSERT INTO chats(friend1, friend2, chatid) VALUES(?, ?, ?);";
        int big = userID > friendID ? userID: friendID;
        int small = big == userID? friendID: userID;
        String chatID = "" + big + ":" + small;
        
        int effect = jdbcTemplate.update(update, big, small, chatID);

        if (effect != 1) {
            throw new Error("error in update profile");
        }
        insertMessage(userID, chatID, "Started chat", false);
        
    }
    
    public Map<String, Object> getProfile(Integer userID){
        String query = "SELECT u.firstname, u.streak, u.username, u.lastname, u.profile, COUNT(CASE WHEN f.accepted = true THEN 1 END) AS totalFriends FROM eatsuser u LEFT JOIN friends f ON (u.userID = f.friend1 OR u.userID = f.friend2) WHERE userID = ? GROUP BY (u.userID);";
        ObjectMapper objectMapper = new ObjectMapper();

        Map<String, Object> result = jdbcTemplate.queryForObject(query, new Object[]{userID}, (rs, rowNum) -> {
            Map<String, Object> row = new HashMap<>();
            row.put("firstname", rs.getString("firstname"));
            row.put("lastname", rs.getString("lastname"));
            row.put("totalFriends", rs.getInt("totalFriends"));
            row.put("userName", rs.getString("username"));
            row.put("streak", rs.getInt("streak"));
            
            String rawProfile = rs.getString("profile");
            JsonNode profileJsonNode = null;

            try {
                if (rawProfile != null && !rawProfile.isEmpty()) {
                    profileJsonNode = objectMapper.readTree(rawProfile);
                }
            } catch (JsonProcessingException e) {
                profileJsonNode = null;
            }

            row.put("profile", profileJsonNode);
            return row;
        });
        return result;
    }
    
    public List<Map<String, Object>> findPeople(Integer userID, String text) {        
        String query = "SELECT u.userid, u.username, u.profile " +
                       "FROM eatsuser u " +
                       "WHERE u.userid != ? " +
                       "AND NOT EXISTS (" +
                       "    SELECT 1 FROM friends f " +
                       "    WHERE (f.friend1 = u.userid AND f.friend2 = ?) " +
                       "       OR (f.friend2 = u.userid AND f.friend1 = ?) " +
                       ") " +
                       "AND u.username LIKE ? " + 
                       "LIMIT 50;";

        return jdbcTemplate.query(query, new Object[] {userID, userID, userID, "%" + text + "%"},
            (rs, rowNum) -> {
                Map<String, Object> row = new HashMap<>();
                row.put("userid", rs.getInt("userid"));
                row.put("username", rs.getString("username"));

                String raw = rs.getString("profile");
                JsonNode profileJsonNode;
                try {
                    profileJsonNode = objectMapper.readTree((String) raw);
                } catch (Exception e) {
                    profileJsonNode = null;
                }
                row.put("profile", profileJsonNode);               
                
                return row;
            });
    }
    
    public boolean insertMessage(String senderUsername, String chatID, String message, boolean flag){
        String sql = "INSERT INTO messages(chatid, senderid, content, imgflag) VALUES (?, (SELECT userid FROM eatsuser WHERE username = ? LIMIT 1), ?, ?);";
        int result = jdbcTemplate.update(sql, chatID, senderUsername, message, flag);
        System.out.println(result);   
        return true;
    }
    
    public boolean insertMessage(int senderID, String chatID, String message, boolean flag){
        String sql = "INSERT INTO messages(chatid, senderid, content, imgflag) VALUES (?, ?, ?, ?);";
        int result = jdbcTemplate.update(sql, chatID, senderID, message, flag);
        System.out.println(result);   
        return true;
    }
    
    public List<Map<String, Object>> getTopMessages(Integer userID) {
        String query =
            "SELECT *\n" +
            "FROM (\n" +
            "    SELECT DISTINCT ON (c.chatid)\n" +
            "        c.chatid,\n" +
            "        m.content,\n" +
            "        m.senderid,\n" +
            "        m.sent_at,\n" +
            "        m.imgflag, \n"+
            "        m.readByReciever,\n" +
            "        CASE \n" +
            "            WHEN c.friend1 = ? THEN u2.username\n" +
            "            ELSE u1.username\n" +
            "        END AS other_username,\n" +
            "        CASE \n" +
            "            WHEN c.friend1 = ? THEN u2.profile\n" +
            "            ELSE u1.profile\n" +
            "        END AS other_profile,\n" +
            "        CASE \n" +
            "            WHEN m.senderid = ? THEN true ELSE false \n" +
            "        END AS youSent\n" +
            "    FROM chats c\n" +
            "    JOIN messages m ON c.chatid = m.chatid\n" +
            "    JOIN eatsuser u1 ON c.friend1 = u1.userid\n" +
            "    JOIN eatsuser u2 ON c.friend2 = u2.userid\n" +
            "    WHERE c.friend1 = ? OR c.friend2 = ?\n" +
            "    ORDER BY c.chatid, m.sent_at DESC\n" +
            ") latest_messages\n" +
            "ORDER BY latest_messages.sent_at DESC;";

        return jdbcTemplate.query(
            query,
            new Object[] { userID, userID, userID, userID, userID },
            (rs, rowNum) -> {
                Map<String, Object> row = new HashMap<>();
                boolean flag = rs.getBoolean("imgflag");
                String content = !flag? rs.getString("content"): "RECIPE";
                row.put("chatId", rs.getString("chatid"));
                row.put("content", content);
                row.put("senderId", rs.getInt("senderid"));
                row.put("sentAt", rs.getTimestamp("sent_at"));
                row.put("readByReciever", rs.getBoolean("readByReciever"));
                row.put("otherUsername", rs.getString("other_username"));
                row.put("youSent", rs.getBoolean("youSent"));

                String rawProfile = rs.getString("other_profile");
                JsonNode profileJson;
                try {
                    profileJson = objectMapper.readTree(rawProfile);
                } catch (Exception e) {
                    profileJson = null;
                }
                row.put("profile", profileJson);

                return row;
            }
        );
    }

    public List<Map<String, Object>> getChats(String roomID, int userid) throws Error{
        String updateQuery = "UPDATE messages SET readbyreciever = true WHERE chatid = ? AND senderid != ?";
        String selectQuery = "SELECT u.username AS sender, m.chatid AS roomID, m.content, 'CHAT' AS messageType " +
                             "FROM messages m JOIN eatsuser u ON m.senderid = u.userid WHERE m.chatid = ? ORDER BY m.sent_at";

        return jdbcTemplate.execute((Connection con) -> {
            con.setAutoCommit(false);

            try {
                try (PreparedStatement ps = con.prepareStatement(updateQuery)) {
                    ps.setString(1, roomID);
                    ps.setInt(2, userid);
                    ps.executeUpdate();
                }

                List<Map<String, Object>> chats = jdbcTemplate.query(selectQuery, new Object[] { roomID },
                    (rs, rowNum) -> {
                        Map<String, Object> row = new HashMap<>();
                        row.put("sender", rs.getString("sender"));
                        row.put("roomID", rs.getString("roomID"));
                        row.put("messageType", rs.getString("messageType"));
                        row.put("content", rs.getString("content"));
                        return row;
                    });

                con.commit();
                return chats;

            } catch (SQLException e) {
                con.rollback();
                throw new Error("Transaction failed, rolled back.", e);
            } finally {
                // Always set auto-commit back to true
                con.setAutoCommit(true);
            }
        });
    }
        
    public String getPush(String sender, int big, int small){
        try{
            String sql = "SELECT username, notificationid FROM eatsuser WHERE userid = ?";

            Map<String, String> result1 = jdbcTemplate.queryForObject(
                sql, 
                new Object[]{big},
                (rs, rowNum) -> {
                    Map<String, String> row = new HashMap<>();
                    row.put("username", rs.getString("username"));
                    row.put("notificationid", rs.getString("notificationid"));
                    return row;
                }
            );
            
            Map<String, String> result2 = jdbcTemplate.queryForObject(
                sql, 
                new Object[]{small},
                (rs, rowNum) -> {
                    Map<String, String> row = new HashMap<>();
                    row.put("username", rs.getString("username"));
                    row.put("notificationid", rs.getString("notificationid"));
                    return row;
                }
            );
            
            System.out.println(result1);
            System.out.println(result2);   
            System.out.println(sender);
            String toSend;
            
            if(result1.get("username").equals(sender)){
                toSend = result2.get("notificationid");
            }
            else{
                toSend = result1.get("notificationid");
            }
            return toSend != "null"? toSend: null;            
        }
        catch(Exception e){
            System.out.println(e.getMessage());
            return null;
        }
    }

    
}
