// Initialize recentSearch array from localStorage
var recentSearch = JSON.parse(localStorage.getItem("recentSearch")) || [];

var audio = new Audio("./assets/audio/click.wav");
var buttons = document.querySelectorAll("button");

$(function () {
	// Set up autocomplete for the search input
	$("#searchTerm").autocomplete({
		source: recentSearch,
	});
});

function fetchData(foodInput, dietInput, alergiesInput, mealTypeInput) {
	// Construct the API query URL
	var queryURL =
		"https://api.edamam.com/api/recipes/v2?type=public&q=" +
		foodInput +
		"&app_id=3cbe9e09&app_key=791997979c9223cd8754bcf36f69f9c2" +
		dietInput +
		alergiesInput +
		mealTypeInput;
	console.log(queryURL);

	// Make AJAX request to the API
	$.ajax({
		url: queryURL,
		method: "GET",
	}).then(function (response) {
		var data = response.hits;
		displayResults(data);
	});
}

function displayResults(data) {
	$("#photo").attr("src", data[0].recipe.image);
	console.log(data[0].recipe.image);
	$("#recipeName").text(data[0].recipe.label);

	// Clear previous ingredient lines
	$(".ingredients").empty();

	// Iterate through the ingredient lines and append them to the ul element
	$.each(data[0].recipe.ingredientLines, function (index, line) {
		$(".ingredients").append("<li>" + line + "</li>");
	});

	// Iterate through the nutrition info and append them to the modal body
	var totalNutrients = data[0].recipe.totalNutrients;
	console.log(totalNutrients);

	$.each(totalNutrients, function (key, nutrient) {
		var label = nutrient.label;
		var quantity = nutrient.quantity.toFixed(2);
		var unit = nutrient.unit;

		var h6Element = $("<h6>").text(label + ": " + quantity + " " + unit);

		$("#modal-body").append(h6Element);
	});

	// Calculate button margin-top
	marginCalc();

	// Additional code for buttons and video search results
	$("#directions").attr("href", data[0].recipe.url);
}

function saveHistory(foodInput) {
	// Check for duplicates
	if (recentSearch.indexOf(foodInput) === -1) {
		recentSearch.push(foodInput);
		recentSearch.sort();
		localStorage.setItem("recentSearch", JSON.stringify(recentSearch));
	}
}

function searchVideos(search) {
	// Construct the API query URL
	var queryURL =
		"https://www.googleapis.com/youtube/v3/search?part=snippet&q=" +
		search +
		"-recipe&type=video&key=AIzaSyDtAcK_TpyMQIgWMG2KE5rlYLkyMZc6_Jo";

	// Make AJAX request to the API
	$.ajax({
		url: queryURL,
		method: "GET",
	}).then(function (response) {
		// Extract relevant data from the API response
		console.log(response);
		displayYouTubeResults(response.items);
	});
}

function displayYouTubeResults(items) {
	// Show the recipeVideos section
	$("#recipeVideos").css("display", "block");

	// Remove the "d-none" class from the elements
	$("#nutritions").removeClass("d-none");
	$("#directions").addClass("d-flex");

	// Clear the videoResult container
	$("#videoResult").empty();

	// Check if there are no search results
	if (items.length === 0) {
		$("#videoResult").html("<p>No results found.</p>");
		return;
	}

	// Iterate through the search results and display each video title and embed code
	$.each(items, function (index, item) {
		// Get the video title and format it
		var videoTitle = item.snippet.title;
		videoTitle = videoTitle.toLowerCase().replace(/\b\w/g, function (char) {
			return char.toUpperCase();
		});

		// Get the video ID
		var videoId = item.id.videoId;

		// Create the video embed code
		var embedCode =
			'<iframe width="560" height="315" src="https://www.youtube.com/embed/' +
			videoId +
			'" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';

		// Append the video title and embed code to the videoResult container
		$("#videoResult")
			.addClass("col-12 text-center mb-3 pt-3")
			.append("<h5>" + videoTitle + "</h5>")
			.append(embedCode);
	});
}

// Calculates the margin to bring the buttons near to search form
function marginCalc() {
	var width = $(window).width();
	console.log("width: " + width);
	if (width >= 992) {
		var stretch = $(leftColumn).height();
		console.log(stretch);

		var margin = (stretch - 555) * -1;
		margin = margin.toFixed();
		console.log(margin);
		$("#foodinfo").css("marginTop", margin + "px");
	}
	$("#foodinfo").addClass("d-block");
}

function addDnoneClass() {
	// Add d-none classes to buttons when search is clicked while epmty
	$("#nutritions").addClass("d-none");
	$("#directions").removeClass("d-flex");
	$("#recipeVideos").css("display", "none");
}

function getInfo() {
	// Get the food name input value and trim any whitespace and capitalize the first letter
	var foodInput = $("#searchTerm").val().trim();
	foodInput = foodInput.charAt(0).toUpperCase() + foodInput.slice(1);
	var dietInput = $("#diet").find(":selected").data("name");
	var alergiesInput = $("#alergies").find(":selected").data("name");
	var mealTypeInput = $("#meal-type").find(":selected").data("name");

	if (foodInput == "") {
		addDnoneClass();
		return;
	}

	// Empty the ul element with class "ingredients"
	$(".ingredients").empty();

	// Save the search history
	saveHistory(foodInput);

	// Fetch recipe data for the entered food name
	fetchData(foodInput, dietInput, alergiesInput, mealTypeInput);

	// Search for related videos
	searchVideos(foodInput);

	// Clear the search term input field
	$("#searchTerm").val("");
}

// Search when you hit enter
$("#searchTerm").on("keydown", function (event) {
	console.log("triggered");
	if (event.keyCode === 13) {
		event.preventDefault();
		console.log("triggered222222");

		getInfo();
	}
});

// Search when you click
$("#searchButton").on("click", function (event) {
	event.preventDefault();

	console.log("search trigger");

	getInfo();
});

$(document).ready(function () {
	// Set a cookie with SameSite attribute
	document.cookie = "cookieName=cookieValue; SameSite=Lax";

	// Hide the recipe videos section
	$("#recipeVideos").css("display", "none");

	// Clear the videoResult container
	$("#videoResult").empty();
});

// Sound is playing when you click
$("button").click(function () {
	$(audio)[0].play();
});
