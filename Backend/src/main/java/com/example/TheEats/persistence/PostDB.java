package com.example.TheEats.persistence;

import com.example.TheEats.objects.Post;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class PostDB {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public String deletePost(int userID, int userPostID) throws Exception {
        String query = """
            DELETE FROM post
            WHERE userid = ? AND userpostid = ?
            RETURNING imgurl;
        """;

        try {
            return jdbcTemplate.queryForObject(
                query,
                String.class,
                userID,
                userPostID
            );
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception("Failed to delete post");
        }
    }
    
    public List<Map<String, Object>> getPostReactions(int userID, String showdate) throws Exception{
        String query = 
        """
            SELECT
                r.rating,
                u.username,
                u.avatarurl
            FROM reactions r
            JOIN eatsuser u ON u.userid = r.reactionowner
            WHERE r.postowner = ? AND r.showdate = ?;
        """;
        try{
            LocalDate date = LocalDate.parse(showdate, DateTimeFormatter.ISO_DATE);

            return jdbcTemplate.queryForList(query, userID, date);
        }
        catch(Exception e){
            e.printStackTrace();
            throw new Exception("sql failure");
        }
        
    }
    
    public boolean insertReaction(String postUsername, int reactionOwner, int rating){
        String query = 
        """
            INSERT INTO reactions (rating, postOwner, reactionOwner)
                VALUES(
                    ?, 
                    (SELECT userid FROM eatsuser WHERE username = ? LIMIT 1), 
                    ?
                )
            ON CONFLICT (showdate, postOwner, reactionOwner) 
            DO UPDATE SET rating = ?;
        """;
        try{
            int inserted = jdbcTemplate.update(query, rating, postUsername, reactionOwner, rating);
            return inserted == 1;            
        }
        catch(Exception e){
            e.printStackTrace();
            return false;
        }
    }
    
    public int insertPost(String caption, 
        boolean homemade, String imgURL, int uID, 
        String[] badges, int stars, String flavor, 
        String quant, String time) {
        
        try {
            String query =
            """
                INSERT INTO post 
                (caption, homemade, imgurl, userid, badges, stars, flavor, quant, time, userpostid) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 
                        COALESCE((SELECT MAX(userpostid) FROM post WHERE userid = ?), 0) + 1)
                RETURNING userpostid
            """;

            int userpostid = jdbcTemplate.queryForObject(query,Integer.class,
                    caption, homemade, imgURL, uID, badges,
                    stars, flavor, quant, time, uID);

            return userpostid;
        } catch (Exception e) {
            e.printStackTrace();
            return -1;
        }
    }
    
    public Map<String, Object> getChoosePostData(int uID) throws Exception {
        String query = """
            SELECT imgurl, userpostid, showdate, caption
            FROM post 
            WHERE userid = ?
              AND createdat >= CURRENT_DATE
              AND createdat < CURRENT_DATE + INTERVAL '1 day';
        """;
        Map<String, Object> response = new HashMap<>();
        try {
            List<Map<String, Object>> allPosts = jdbcTemplate.queryForList(query, uID);

            int index = IntStream.range(0, allPosts.size())
                .filter(i -> allPosts.get(i).get("showdate") != null)
                .findFirst()
                .orElse(-1);

            response.put("allPosts", allPosts);
            response.put("specialPost", index);

        } catch (Exception e) {
            throw new Exception("FAILED TO GET CHOOSE");
        }

        return response;
    }
    
    @Transactional
    public boolean changeTodayPost(int uID, int newPostId, boolean flag) throws Exception {
        String clearSpotlightSql = "UPDATE post SET showdate = NULL WHERE userid = ? AND createdat::date = CURRENT_DATE;";
        jdbcTemplate.update(clearSpotlightSql, uID);
        String changeAndStatsSql = "";
        if (flag){
            changeAndStatsSql = 
            """
                WITH updated_post AS (
                    UPDATE post 
                    SET showdate = CURRENT_DATE + INTERVAL '1 day' 
                    WHERE userid = ? AND userpostid = ?
                    RETURNING userid, showdate
                )
                UPDATE eatsuser u
                SET 
                    totalPost = u.totalPost + 1,

                    totalSpotlight = CASE 
                        WHEN u.lastDate IS NULL OR up.showdate != u.lastDate THEN u.totalSpotlight + 1 
                        ELSE u.totalSpotlight 
                    END,

                    streak = CASE 
                        WHEN up.showdate = u.lastDate + INTERVAL '1 day' THEN u.streak + 1
                        WHEN u.lastDate IS NULL OR up.showdate != u.lastDate THEN 1 -- Starts a new streak!
                        ELSE 1
                    END,

                    lastDate = up.showdate
                FROM updated_post up
                WHERE u.userid = up.userid;
            """;            
        }
        else{
            changeAndStatsSql = 
            """
                UPDATE post 
                SET showdate = CURRENT_DATE + INTERVAL '1 day' 
                WHERE userid = ? AND userpostid = ?;
            """;
        }


        int rowsUpdated = jdbcTemplate.update(changeAndStatsSql, uID, newPostId);

        if (rowsUpdated != 1) {
            throw new Exception("FAILED TO UPDATE POST AND STATS");
        }

        return true;
    }
    
    public List<Post> getAllPostsMonth(int userID, String monthYear) {

        YearMonth ym = YearMonth.parse(monthYear); // e.g., "2026-04"

        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.plusMonths(1).atDay(1).atStartOfDay();
        
        String sql = """
            SELECT *
            FROM post
            WHERE userid = ?
              AND createdat >= ?
              AND createdat < ?
            ORDER BY createdat DESC
        """;

        return jdbcTemplate.query(sql, 
            new Object[]{
                userID, 
                java.sql.Timestamp.valueOf(start), 
                java.sql.Timestamp.valueOf(end)
            }, 
            (rs, rowNum) -> {
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
                    rs.getDate("showdate") != null ? rs.getDate("showdate").toLocalDate() : null,
                    rs.getInt("userpostid"), 
                    rs.getTimestamp("createdat") != null ? rs.getTimestamp("createdat").toLocalDateTime() : null
                );
        });
    }
    
    public Integer getAllSpotlightCount(int userID){
        String query = "SELECT totalSpotlight FROM eatsuser WHERE userid = ?;";
        try{
            return jdbcTemplate.queryForObject(query, Integer.class, userID);
        }
        catch(Exception e){
            e.printStackTrace();
            return 0;
        }
    }

    public Integer getStreak(int userID){
        String query = "SELECT streak FROM eatsuser WHERE userid = ?;";
        try{
            return jdbcTemplate.queryForObject(query, Integer.class, userID);
        }
        catch(Exception e){
            e.printStackTrace();
            return 0;
        }
    }
    
    public Integer getAllPostsCount(int userID){
        String query = "SELECT totalPost FROM eatsuser WHERE userid = ?;";
        try{
            return jdbcTemplate.queryForObject(query, Integer.class, userID);
        }
        catch(Exception e){
            e.printStackTrace();
            return 0;
        }
    }
    
    public Map<String, Integer> getAllJars(int userID, int offset) {
        int start = offset * 12;

        String query = """
            SELECT 
                COUNT(DISTINCT DATE(createdat)) AS count,
                TO_CHAR(DATE_TRUNC('month', createdat), 'FMMonth YYYY') AS month
            FROM post
            WHERE userid = ?
            GROUP BY DATE_TRUNC('month', createdat)
            ORDER BY DATE_TRUNC('month', createdat) DESC
            OFFSET ?
            LIMIT 12;
        """;

        try {
            return jdbcTemplate.query(query, new Object[]{userID, start}, rs -> {
                Map<String, Integer> result = new LinkedHashMap<>();

                while (rs.next()) {
                    String month = rs.getString("month");
                    int count = rs.getInt("count");

                    result.put(month, count);
                }

                return result;
            });

        } catch (Exception e) {
            e.printStackTrace();
            return new HashMap<>();
        }
    }
    
    public Map<String, List<List<Object>>> getAllSpotlight(int userID, int offset) {
        int start = offset * 14;

        String query = """
            SELECT *
            FROM post
            WHERE userid = ?
            AND showdate IS NOT NULL
            ORDER BY showdate DESC
            LIMIT 14 OFFSET ?;
        """;

        try {
            return jdbcTemplate.query(query, rs -> {
                Map<String, List<List<Object>>> result = new LinkedHashMap<>();

                while (rs.next()) {
                    String date = rs.getString("showdate");
                    String imgUrl = rs.getString("imgurl");
                    int postId = rs.getInt("userpostid");

                    List<Object> value = new ArrayList<>();
                    value.add(imgUrl);
                    value.add(postId);

                    List<String> badges = rs.getArray("badges") != null
                    ? Arrays.asList((String[]) rs.getArray("badges").getArray())
                    : List.of();
                    
                    Post forRoute = new Post(
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
                    value.add(forRoute);

                    result.computeIfAbsent(date, k -> new ArrayList<>()).add(value);
                }

                return result;
            }, userID, start);

        } catch (Exception e) {
            e.printStackTrace();
            return new HashMap<>();
        }
    }

    
}