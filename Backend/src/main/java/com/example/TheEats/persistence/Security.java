package com.example.TheEats.persistence;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import io.jsonwebtoken.*;
import java.util.Date;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import java.nio.charset.StandardCharsets;
import io.jsonwebtoken.security.Keys;
import java.security.Key;

@Configuration
public class Security {
  
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final long expiration = 1000L * 60 * 60 * 24 * 7;
    
    private final Environment env;
    private final Key signingKey;

    @Autowired
    public Security(Environment env){
        this.env = env;
        String secret = env.getProperty("SECRETJWT");
        if (secret == null) throw new IllegalArgumentException("SECRETJWT is not set");
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public Security(String secret){
        this.env = null;
        if (secret == null) throw new IllegalArgumentException("Secret cannot be null");
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String userID){
        return Jwts.builder()
            .setSubject(userID)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(signingKey, SignatureAlgorithm.HS512)
            .compact();
    }
    
    public Integer validateToken(String token) throws Error{
        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
            Date exp = claims.getExpiration();
            String id = claims.getSubject();
            Integer userid = Integer.parseInt(id);
            if(exp.after(new Date())){
                return userid;
            }
            
            throw new Error("Failed Auth");
                        
        } catch (JwtException e) {
            System.err.println("Invalid JWT: " + e.getMessage());
            throw new Error("Failed Auth");
        }
    }
    
    public boolean match(String raw, String encoded){
        return encoder.matches(raw, encoded);
    }
    
    public String hashPassword(String rawPassword) {
        return encoder.encode(rawPassword);
    }
    
    public void validateChat(String room, int userID) throws Exception{
        String[] ids = room.split(":");
        for(String each: ids){
            if(Integer.parseInt(each) == userID){
                return;
            }
        }
        throw new Exception("invalid request for chat");
    }

}
