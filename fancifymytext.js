

const biggerButton = document.getElementById("biggerButton");
const fancyButton = document.getElementById("fancyButton");
const boringButton = document.getElementById("boringButton");

biggerButton.addEventListener("click", makeBigger);
fancyButton.addEventListener("change", makeFancy);
boringButton.addEventListener("change", makeBoring);


function makeBigger() {
    alert("Hello, world!");
    document.getElementById("text").style.fontSize = "24pt";
    
}

function makeFancy() {
    alert("Fancy!");
    document.getElementById("text").style.fontWeight = "bold";
    document.getElementById("text").style.color = "blue";
    document.getElementById("text").style.textDecoration = "underline";
}

function makeBoring() {
    alert("Boring...");
    document.getElementById("text").style.fontWeight = "normal";
    document.getElementById("text").style.color = "black";
    document.getElementById("text").style.textDecoration = "none";
}

function makeMoo() {
    alert("Moo!");
    var text = document.getElementById("text").value;
    text = text.toUpperCase();
    var sentences = text.split(".");
    text = sentences.join("-Moo.");
    document.getElementById("text").value = text;
}