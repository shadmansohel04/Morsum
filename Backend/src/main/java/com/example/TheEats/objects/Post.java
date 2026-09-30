package com.example.TheEats.objects;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class Post {

    private String caption;
    private boolean homemade;
    private String imgurl;
    private List<String> badges;
    private int stars;
    private String flavor;
    private String quant;
    private String time;

    //DEPENDENT
    private String username;
    private String avatarurl;
    private LocalDate date;
    private LocalDateTime createdAt;
    private boolean active;
    private int userid;
    private int postid;
    
    //FOR MY SPOTLIGHT
    public Post(String caption, boolean homemade, String imgurl,
                List<String> badges, int stars, String flavor,
                String quant, String time, LocalDate date, int postid, LocalDateTime when) {
        this.caption = caption;
        this.homemade = homemade;
        this.imgurl = imgurl;
        this.badges = badges;
        this.stars = stars;
        this.flavor = flavor;
        this.quant = quant;
        this.time = time;
        this.postid = postid;
        this.createdAt = when;
        //DEPENDENT ON CASE
        this.active = false;
        this.username = "";
        this.avatarurl = "";
        this.date = date;
        this.userid = -1;
    }

    //FOR FRIENDS SPOTLIGHTS
    public Post(String caption, boolean homemade, String imgurl,
                String avatarurl, List<String> badges, int stars, 
                String flavor, String quant, String time,
                String username, int userid, LocalDateTime when) {
        this.caption = caption;
        this.homemade = homemade;
        this.imgurl = imgurl;
        this.badges = badges;
        this.stars = stars;
        this.flavor = flavor;
        this.quant = quant;
        this.time = time;
        this.createdAt = when;
        //DEPENDENT ON CASE
        this.active = true;
        this.username = username;
        this.date = null;
        this.userid = userid;
        this.avatarurl = avatarurl;
    }
    
    public String getCaption() { return caption; }
    public boolean isHomemade() { return homemade; }
    public String getImgurl() { return imgurl; }
    public List<String> getBadges() { return badges; }
    public void setBadges(List<String> badges) { this.badges = badges; }

    public int getStars() { return stars; }
    public String getFlavor() { return flavor; }

    public String getQuant() { return quant; }

    public String getTime() { return time; }

    public LocalDate getDate() { return date; }
    public void setCreatedAt(LocalDate date) { this.date = date; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getAvatarurl() { return avatarurl; }
    public void setAvatarurl(String avatarurl) { this.avatarurl = avatarurl; }

    public int getUserid() { return userid; }
    public void setUserid(int userid) { this.userid = userid; }

    public int getPostid() { return postid; }
    public void setPostid(int postid) { this.postid = postid; }
    
    public LocalDateTime getCreatedAt() {return createdAt;}

    
}