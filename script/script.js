$(document).ready(function(){
	var headerTop = $('.menu-bar').offset().top;
	$(window).scroll(function(){
		if($(window).scrollTop() > headerTop){
			$('.menu-bar').addClass('menu-bar-scroll');
		} else {
			$('.menu-bar').removeClass('menu-bar-scroll');
		}
	});
});

function openModal(id){
	document.getElementById(id).style.display = "block";	
}

function closeModal(id){
	document.getElementById(id).style.display = "none";
}

var slideIndex = 1;
//showSlides(slideIndex);

function plusSlides(n){
	showSlides(slideIndex += n);
}

function currentSlide(n){
	showSlides(slideIndex = n);
}

function showSlides(n){
	var slides = document.getElementsByClassName("slides");
	var slideCount = document.getElementById("slide-count");
	var slideLength = slides.length;
	if (n > slideLength){
		slideIndex = 1;
	}
	if(n < 1){
		slideIndex = slideLength;
	}
	for (var i = 0; i< slideLength; i++){
		slides[i].style.display = "none";
	}
	slideCount.innerHTML = slideIndex + " / " + slideLength;
	slides[slideIndex-1].style.display = "block";
}