export const Colors = { 
    light:{
        background: 'rgb(236, 231, 231)',
        fillColor: 'rgba(88, 132, 244, 0.2)',
        textColor: 'black',
        halfBackground: 'white',
        fullText: 'white',
        pop: 'rgb(88,132,244)',
        tabBar: 'white',
        placeholder: 'rgba(103, 97, 97, 1)'

    },
    dark:{
        background: 'black',
        fillColor: 'rgba(88,132,244, 0.2)',
        textColor: 'white',
        halfBackground: '#302c2c',
        fullText: 'black',
        tabBar: 'black',
        pop: 'rgb(88,132,244)',
        placeholder: 'rgba(255, 255, 255, 0.7)'
    }
}

export const person = {
    skinColor:
    [
        { name: "Very Light", rgb: "rgb(255, 229, 204)" },
        { name: "Light Warm", rgb: "rgb(255, 204, 153)" },
        { name: "Light Olive", rgb: "rgb(220, 180, 140)" },
        { name: "Medium Beige", rgb: "rgb(210, 160, 125)" },
        { name: "Light Brown", rgb: "rgb(190, 145, 105)" },
        { name: "Tan", rgb: "rgb(145, 105, 75)" },
        { name: "Brown", rgb: "rgb(120, 90, 60)" },
        { name: "Ebony", rgb: "rgb(49, 29, 20)" }
    ],
    hairColor: [
        { name: "Black", rgb: "rgb(10, 10, 10)" },
        { name: "Dark Brown", rgb: "rgb(50, 30, 10)" },
        { name: "Light Brown", rgb: "rgb(130, 90, 60)" },
        { name: "Blonde", rgb: "rgb(255, 230, 160)" },
        { name: "Platinum Blonde", rgb: "rgb(250, 245, 230)" },
        { name: "Red", rgb: "rgb(200, 80, 40)" },
        { name: "Grey", rgb: "rgb(180, 180, 180)" }
    ],
    hairStyle:[
        "normal", 
        "thick", 
        "mohawk", 
        "womanLong", 
        "womanShort",
        "mohawk", //USED FOR AFRO 5
        "normal", //USED FOR SPIKE 6,
    ],
    hatStyle:[
        "none", 
        "beanie", 
        "turban"
    ],
    hatColor: [
        "rgb(255, 150, 150)",
        "rgb(150, 255, 150)",
        "rgb(150, 150, 255)",
        "rgb(255, 255, 150)",
        "rgb(255, 200, 100)",
        "rgb(180, 130, 180)",
        "rgb(150, 150, 150)",
        "rgb(230, 230, 230)"
    ],
    eyeStyle:[
        "circle",
        "oval", 
        "smile"
    ],
    glassesStyle:[
        "none", 
        "round", 
        "square"
    ],
    noseStyle:[
        "short", "long", "round"
    ],
    mouthStyle:[
        "laugh", "smile", "peace"
    ],
    shirtStyle:[
        "hoody", "short", "polo"
    ],
    shirtColor: [
        "rgb(255, 230, 230)", // Light pink
        "rgb(230, 255, 230)", // Light mint green
        "rgb(230, 230, 255)", // Light lavender
        "rgb(255, 255, 230)", // Light cream
        "rgb(255, 204, 153)", // Soft peach
        "rgb(204, 153, 255)", // Light purple
        "rgb(200, 100, 255)", // Lavender
        "rgb(150, 200, 255)", // Soft blue
        "rgb(255, 180, 120)", // Soft orange
        "rgb(180, 255, 180)", // Light green
        "rgb(255, 150, 200)", // Light rose
        "rgb(220, 180, 255)"  // Light violet
    ],
    bgColor: [
        "rgb(245, 245, 245)", // Very light gray
        "rgb(240, 240, 255)", // Very light blue
        "rgb(255, 245, 235)", // Light peach
        "rgb(235, 255, 240)", // Very light mint green
        "rgb(250, 240, 255)", // Very light lavender
        "rgb(255, 240, 200)", // Soft cream
        "rgb(220, 240, 255)", // Light sky blue
        "rgb(230, 220, 255)", // Light periwinkle
        "rgb(255, 235, 180)", // Soft yellow
        "rgb(200, 255, 255)", // Soft cyan
        "rgb(180, 240, 210)", // Soft teal
        "rgb(210, 210, 210)", // Neutral light gray
        "rgb(255, 0, 0)",     // Vibrant red
        "rgb(0, 255, 0)",     // Vibrant green
        "rgb(0, 0, 255)",     // Vibrant blue
        "rgb(255, 165, 0)"    // Vibrant orange
    ]


}

export const theme = {
    dark:{
        titleText: "#FF8762",
        boldText: "#FFF5E1",
        subtleText: "#98907F",
        background: "#0d0f0c",
        labelText: "rgb(227, 231, 222)",
    },
    font:{
        title: "Plus Jakarta Sans",
        capLabel: "Inter",
        subText: "Be Vietnam Pro"
    }
}

export const DARKTHEME = {
  bg: "#0d0f0c",
  accent: "#FF8762",
  accentGreen: "#7EDC84",
  surface: "#141612",
  bottom: "#1d201c",
  text: "#FFFFFF",
  textSoft: "#E3E7DE",
};

export const LIGHTTHEME = {
  bg: "#F7F8F5",
  accent: "#FF8762",
  accentGreen: "#7EDC84",
  surface: "#FFFFFF",
  bottom: "#E6E9E2",
  text: "#1A1D18",
  textSoft: "#5F665A",
};