$(document).ready(function(){
	$('#photo-entry-group').on('click', '.removePhoto', removePhotoEntry);
	$('#region-select').hide();
	$('#tagType').change(function(){
		if($('#tagType option:selected').text() == 'Country'){
			$('#region-select').show();
		}else{
			$('#region-select').hide();
		}
	});
	$('.countries').hide();
	$('.expand').on('click', function(){
		var countryDropdown = $(this).closest('.link').next('.countries');
		if(countryDropdown.is(':hidden')){
			countryDropdown.show();
		}else{
			countryDropdown.hide();
		}	
	});
	$('.search-icon').on('click', function(){
		var searchField = document.getElementById('search-field');
		if($('#search-field').css('display') == 'none'){
			searchField.style.display = 'inline-block';
		} else {
			searchField.style.display = 'none';
		}
		
	});
});

// modal scripts
var slideIndex = 1;

function openModal(id){
	document.getElementById(id).style.display = "block";	
}

function closeModal(id){
	document.getElementById(id).style.display = "none";
}

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

// add/remove photo entry
function addPhotoEntry(){
	//create photo-entry div
	var photoEntryDiv = document.createElement("div");
	photoEntryDiv.className = 'photo-entry';
	
	//create photo url input element
	var photoInputDiv = document.createElement("div");
	var photoInput = document.createElement("input");
	photoInput.className = 'input-group photo';
	photoInput.type = 'file';
	photoInput.name = 'photo';
	photoInput.placeholder = 'Photo URL';
	photoInputDiv.appendChild(photoInput);
	
	//create photo description textarea element
	var photoDescDiv = document.createElement("div");
	var photoDesc = document.createElement("textarea");
	photoDesc.className = 'input-group photo-description';
	photoDesc.type = 'text';
	photoDesc.rows = '10';
	photoDesc.cols = '30';
	photoDesc.name = 'photoDescription';
	photoDescDiv.appendChild(photoDesc);
	
	//create remove button
	var button = document.createElement("input");
	button.className = 'removePhoto';
	button.type = 'button';
	button.value='Remove photo';
	
	photoEntryDiv.appendChild(photoInputDiv);
	photoEntryDiv.appendChild(photoDescDiv);
	photoEntryDiv.appendChild(button);

	document.getElementById('photo-entry-group').appendChild(photoEntryDiv);
}

function removePhotoEntry(){
	$(this).closest('.photo-entry').remove();
}