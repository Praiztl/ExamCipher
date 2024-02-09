var slideIndex = 0;
var timer;

function showSlides() {

    var slides = document.getElementsByClassName("mySlides");
    var dots = document.getElementsByClassName("dots");

    for (var i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    
    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1;
    }    
    
    for (i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active-btn");
    }

    slides[slideIndex-1].style.display = "block";  
    dots[slideIndex-1].classList.add("active-btn");
    timer = setTimeout(showSlides, 5000); // Change image every 5 seconds/

}

showSlides();

function currentSlide(id) {

    var slides = document.getElementsByClassName("mySlides");
    var dots = document.getElementsByClassName("dots");
    
    clearTimeout(timer);

    for (var i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }

    for (i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active-btn");
    }

    slides[id].style.display = "block";  
    dots[id].classList.add("active-btn");

    slideIndex = id;

    setTimeout(() => {
        showSlides();
    }, 5000);

}


function switchNav(opt) {
    const exam = document.getElementById('examsHistoryNav');
    const contact = document.getElementById('contactInfo');
    const examNav = document.getElementById('examsNav');
    const contactNav = document.getElementById('contactNav');

    if (opt === "exams") {
        exam.classList.remove('hide');
        examNav.classList.add('active-nav');
        contact.classList.add('hide');
        contactNav.classList.remove('active-nav');
    } else {
        exam.classList.add('hide');
        examNav.classList.remove('active-nav');
        contact.classList.remove('hide');
        contactNav.classList.add('active-nav');
    }
}