package com.example.TheEats.objects;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Recipe {
    
    @JsonProperty("recipeName")
    private String recipeName;

    @JsonProperty("ingredients")    
    private String[] ingredients;

    @JsonProperty("steps")    
    private String[] steps;
    
    private String url;

    private static final Set<String> ConstING = new HashSet<String>(Set.of(
        "banana", "bell pepper", "bread", "bulgur", "cabbage", "carrot", "cheese",
        "chicken", "chickpeas", "cucumber", "egg", "eggplant", "farfalle pasta",
        "fusilli pasta", "garlic", "green pepper", "ground meat", "ketchup",
        "lemon", "margarine", "mayonnaise", "milk", "mushroom", "olive", "olive oil",
        "onion", "parsley", "potato", "red lentils", "rice", "sausage", "spaghetti",
        "tomato", "tomato paste", "turkish dumplings", "yogurt", "zucchini"
    ));

    public Recipe(String name, String[] ingredients, String[] steps, String url){
        this.recipeName = name;
        this.ingredients = ingredients;
        this.steps = steps;
        this.url = url;
    }
    
    public Recipe() {}
    
    public String getName(){
        return this.recipeName;
    }
    
    public String[] getIngredients(){
        return this.ingredients;
    }
    
    public String[] getSteps(){
        return this.steps;
    }
    
    public void setSteps(String[] steps){
        this.steps = steps;
    }
    
    public void setIngredients(String[] ingredients){
        this.ingredients = ingredients;
    }
    
    public void setName(String name){
        this.recipeName = name;
    }
    
    public static String[] parseRecipe(String chunk) {
        String[] splitted = chunk.split("\\d+\\.|\\n");
        
        return Arrays.stream(splitted)
            .map(s -> s.trim())
            .filter(s -> !s.isEmpty())
            .toArray(String[]::new);
    }
    
    public static List<String> parseIngredients(String paragraph) {
        List<String> ingredients = new ArrayList<>();

        // Regex to capture groups: amount, unit (optional), and ingredient name
        String regex = "(\\d+\\s?\\d*/?\\d*)\\s*(cups?|cup|teaspoons?|tsp|tablespoons?|tbsp|grams?|g|ml|liters?|l|oz|pounds?|lb|stick|sticks)?\\s*(.*?)(?:,|\\.|and|$)";
        Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(paragraph);

        while (matcher.find()) {
            String amount = matcher.group(1).trim();
            String unit = matcher.group(2) != null ? matcher.group(2).trim() : "";
            String name = matcher.group(3).trim();

            // Skip if name is missing
            if (!name.isEmpty()) {
                ingredients.add(amount + " " + unit + " " + name);
            }
        }
        return ingredients;
    }
    
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("Recipe Name: ").append(recipeName).append("\n");

        sb.append("Ingredients: \n");
        for (String ingredient : ingredients) {
            sb.append("- ").append(ingredient).append("\n");
        }

        sb.append("Steps: \n");
        for (String step : steps) {
            sb.append("- ").append(step).append("\n");
        }

        return sb.toString();
    }

    
}
