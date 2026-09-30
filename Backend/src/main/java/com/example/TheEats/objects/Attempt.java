package com.example.TheEats.objects;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Attempt {
    
    @JsonProperty("recipeID")
    private int recipeID;

    @JsonProperty("taste")    
    private int taste;

    @JsonProperty("accuracy")    
    private int accuracy;
    
    @JsonProperty("ease")
    private int ease;

    public int getRecipeID(){
        return this.recipeID;
    }

    public int getTaste(){
        return this.taste;
    }
    
    public int getAccuracy(){
        return this.accuracy;
    }
    
    public int getEase(){
        return this.ease;
    }
    
    public void setRecipeID(int id){
        this.recipeID = id;
    }
    
    public void setTaste(int val){
        this.taste = val;
    }
    
    public void setAccuracy(int val){
        this.accuracy = val;
    }
    
    public void setEase(int val){
        this.ease = val;
    }
    
    @Override
    public String toString(){
        StringBuilder sb = new StringBuilder();
        sb.append("Recipe ID: ").append(this.recipeID).append("\n")
        .append("taste: ").append(this.taste).append("\n")
        .append("accuracy: ").append(this.accuracy).append("\n")
        .append("ease: ").append(this.ease).append("\n");
        
        return sb.toString();
        
    }
    
}
