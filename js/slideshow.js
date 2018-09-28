var slideIndex = 1;
var slides = document.getElementsByClassName("mySlides");
var autoSlideSpeed = 5000;
showSlides(slideIndex);
setTimeout(autoSlides, autoSlideSpeed);

// Next/Prev controls
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    var i;
    var images = document.getElementsByClassName("slideImg");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < images.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i <images.length; i++) {
        images[i].className = images[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "block";
    images[slideIndex-1].className += " active";
}

function autoSlides() {
    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1}    
    showSlides(slideIndex);
    setTimeout(autoSlides, autoSlideSpeed);
}