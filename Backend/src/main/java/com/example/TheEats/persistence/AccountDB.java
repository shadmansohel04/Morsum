package com.example.TheEats.persistence;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AccountDB {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public boolean createUser(String email, String hashed, String username){
        String query = "INSERT INTO eatsuser(email, username, password) VALUES (?, ?, ?);";
        try{
            jdbcTemplate.update(query, email, username, hashed);
            return true;
        }
        catch(Exception e){
            e.printStackTrace();
            return false;
        }
    }
    
    public int getFriendCount(int userID){
        String query = "SELECT COUNT(*) FROM FRIENDS WHERE friend1 = ? OR friend2 = ?";
        try{
            return jdbcTemplate.queryForObject(query, Integer.class, userID, userID);
        }
        catch(Exception e){
            return 0;
        }
    }
    
    public boolean friendRequest(int userID, String friendUserName){
        String update = 
        """
            INSERT INTO friends (friend1, friend2, requested)
            VALUES (
                GREATEST(?, (SELECT userID FROM eatsuser WHERE username = ? LIMIT 1)),
                LEAST(?, (SELECT userID FROM eatsuser WHERE username = ? LIMIT 1)),
                ?
            );                
        """;
        try{
            return (jdbcTemplate.update(update, userID, friendUserName, userID, friendUserName, userID) == 1);
        }
        catch(Exception e){
            return false;
        }
    }
    
    public void deleteFriend(int userID, int friendID) throws Exception{
        int big = userID > friendID ? userID: friendID;
        int small = big == userID? friendID: userID;
            
        String update = "DELETE FROM friends WHERE friend1 = ? AND friend2 = ?;";
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
    
    public List<Map<String, Object>> getFriends(int userID){
        String query = 
        """
            SELECT u.userid, u.avatarurl, u.username, f.accepted, f.requested
            FROM friends f
            JOIN eatsuser u 
                ON (u.userid = f.friend1 OR u.userid = f.friend2)
            WHERE (f.friend1 = ? OR f.friend2 = ?)
                AND u.userid != ?;
        """;
        return jdbcTemplate.query(query, new Object[]{userID, userID, userID},
            (rs, rownum)->{
                Map<String, Object> row = new HashMap<>();
                row.put("userid", rs.getInt("userid"));
                row.put("username", rs.getString("username"));
                row.put("avatarurl", rs.getString("avatarurl"));
                row.put("accepted", rs.getBoolean("accepted"));
                row.put("requested", rs.getInt("requested"));
                return row;
            }
        );
    }
    
    public List<Map<String, Object>> findPeople(int userID, String text) {        
        String query = 
        """
            SELECT u.avatarurl, u.username, u.userid
            FROM eatsuser u
            WHERE u.userid != ?
            AND NOT EXISTS (
                SELECT 1
                FROM friends f
                WHERE (f.friend1 = u.userid AND f.friend2 = ?)
                   OR (f.friend2 = u.userid AND f.friend1 = ?)
            )
            AND u.username LIKE ?
            LIMIT 50;                       
        """;

        return jdbcTemplate.query(query, new Object[] {userID, userID, userID, "%" + text + "%"},
            (rs, rowNum) -> {
                Map<String, Object> row = new HashMap<>();
                row.put("userid", rs.getInt("userid"));
                row.put("username", rs.getString("username"));
                return row;
            });
    }
    
    public String getAvatar(int userID){
        String query = "SELECT avatarurl FROM eatsuser WHERE userid = ? LIMIT 1";
        try{
            return jdbcTemplate.queryForObject(query, String.class, userID);
        }catch(Exception e){
            e.printStackTrace();
            return "";
        }
    }
    
    public boolean updateAvatar(String url, int userID){
        String query = 
        """
        UPDATE eatsuser
        SET avatarurl = ?
        WHERE userid = ?;
        """;

        try{
            int ret = jdbcTemplate.update(query, url, userID);
            return ret == 1;
        } catch(Exception e){
            e.printStackTrace();
            return false;
        }
    }
 
    public Map<String, Object> loginUser(String email){
        String query = "SELECT userid, password, username, createdat, avatarurl FROM eatsuser WHERE email = ?";
        try{
            Map<String, Object> person = jdbcTemplate.queryForMap(query, email);
            return person;
        }
        catch (Exception e){
            return null;
        }
    }
    
    
    
}
