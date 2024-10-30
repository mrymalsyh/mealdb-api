// Get references to HTML elements
var searchBtn = document.getElementById('search-btn');
var mealList = document.getElementById('meal');
var mealDetailsContent = document.querySelector('.meal-details-content');
var recipeCloseBtn = document.getElementById('recipe-close-btn');
var ingredientSelect = document.getElementById('ingredient-select');
var sortBtn = document.getElementById('sort-btn');

var fetchedMeals = [];
var uniqueIngredients = new Set(); // Store unique ingredients

// Event listeners
searchBtn.onclick = getMealList;
mealList.onclick = handleMealListClick;
recipeCloseBtn.onclick = function () {
    mealDetailsContent.parentElement.classList.remove('showRecipe');
};
sortBtn.onclick = sortMealsByIngredients;

// Get meal list based on ingredient input
function getMealList() {
    var searchInputTxt = document.getElementById('search-input').value.trim();
    if (searchInputTxt === "") {
        mealList.innerHTML = "<p>Please enter an ingredient!</p>";
        mealList.classList.add('notFound');
        return;
    }

    fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=' + searchInputTxt)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            var html = "";
            if (data.meals) {
                fetchedMeals = []; 
                uniqueIngredients.clear(); 

                for (var i = 0; i < data.meals.length; i++) {
                    (function(mealId) {
                        fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + mealId)
                            .then(function(response) {
                                return response.json();
                            })
                            .then(function(mealDetail) {
                                fetchedMeals.push(mealDetail.meals[0]);
                                addIngredientsToSet(mealDetail.meals[0]);
                                displayMeals(fetchedMeals);
                                populateIngredientDropdown();
                            });
                    })(data.meals[i].idMeal);
                }
            } else {
                html = "<p>Sorry, we didn't find any meal!</p>";
                mealList.classList.add('notFound');
                mealList.innerHTML = html;
            }
        });
}

// Add ingredients to the unique set
function addIngredientsToSet(meal) {
    for (var i = 1; i <= 20; i++) {
        var ingredient = meal['strIngredient' + i];
        if (ingredient) {
            uniqueIngredients.add(ingredient.trim());
        }
    }
}

// Populate the ingredient dropdown menu
function populateIngredientDropdown() {
    ingredientSelect.innerHTML = '<option value="">Select an ingredient</option>';
    uniqueIngredients.forEach(function(ingredient) {
        var option = document.createElement('option');
        option.value = ingredient;
        option.textContent = ingredient;
        ingredientSelect.appendChild(option);
    });
}

// Display meals in the list
function displayMeals(meals) {
    var html = "";
    if (meals.length > 0) {
        for (var i = 0; i < meals.length; i++) {
            html += `
                <div class="meal-item" data-id="${meals[i].idMeal}">
                    <div class="meal-img">
                        <img src="${meals[i].strMealThumb}" alt="food">
                    </div>
                    <div class="meal-name">
                        <h3>${meals[i].strMeal}</h3>
                        <a href="#" class="recipe-btn">Get Recipe</a>
                        <a href="#" class="add-to-planner-btn">Add to Meal Planner</a>
                    </div>
                </div>
            `;
        }
        mealList.classList.remove('notFound');
    } else {
        html = "<p>Sorry, no meals found!</p>";
        mealList.classList.add('notFound');
    }
    mealList.innerHTML = html;
}

// Sort meals by ingredient
function sortMealsByIngredients() {
    var selectedIngredient = ingredientSelect.value;
    if (selectedIngredient) {
        var filteredMeals = [];
        for (var i = 0; i < fetchedMeals.length; i++) {
            if (getMealIngredients(fetchedMeals[i]).indexOf(selectedIngredient) !== -1) {
                filteredMeals.push(fetchedMeals[i]);
            }
        }
        displayMeals(filteredMeals);
    } else {
        displayMeals(fetchedMeals);
    }
}

// Get all ingredients for a meal
function getMealIngredients(meal) {
    var ingredients = [];
    for (var i = 1; i <= 20; i++) {
        var ingredient = meal['strIngredient' + i];
        if (ingredient) {
            ingredients.push(ingredient.trim());
        }
    }
    return ingredients;
}


// Handle meal list click events
function handleMealListClick(event) {
    var target = event.target; // Get the element that was clicked
    if (target.classList.contains('recipe-btn')) {
        event.preventDefault(); // Prevent the default anchor link behavior
        var mealItem = target.parentElement.parentElement;
        fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + mealItem.dataset.id)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                mealRecipeModal(data.meals);
            });
    } else if (target.classList.contains('add-to-planner-btn')) {
        event.preventDefault(); // link <a> bila click akan refreshed page so kena pakai prevent default nak staykan dia
        var mealItem = target.parentElement.parentElement;
        addToMealPlanner(mealItem.dataset.id);
    }
}


// Show recipe details in modal
function mealRecipeModal(meal) {
    meal = meal[0];
    var ingredientsHTML = "<h3>Ingredients:</h3><ul>";

    for (var i = 1; i <= 20; i++) {
        var ingredient = meal['strIngredient' + i];
        var measure = meal['strMeasure' + i];
        if (ingredient && ingredient.trim() !== "") {
            ingredientsHTML += `<li>${measure ? measure.trim() : ""} ${ingredient.trim()}</li>`;
        }
    }

    ingredientsHTML += "</ul>";

    var html = `
        <h2 class="recipe-title">${meal.strMeal}</h2>
        <p class="recipe-category">${meal.strCategory}</p>
        <div class="recipe-instruct">
            <h3>${meal.strArea} ${meal.strCategory}</h3>
        </div>
        ${ingredientsHTML} 
        <div class="recipe-instruct">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>
        <div class="recipe-meal-img">
            <img src="${meal.strMealThumb}" alt="">
        </div>
        <div class="recipe-link">
            <a href="${meal.strYoutube}" target="_blank">Watch Video</a>
        </div>
    `;
    
    mealDetailsContent.innerHTML = html;
    mealDetailsContent.parentElement.classList.add('showRecipe');
}

// Array to store planned meals
var mealPlanner = [];

// Add meals to planner without replacing existing meals
function addToMealPlanner(mealID) {
    var existingMeals = JSON.parse(localStorage.getItem('mealPlanner')) || [];
    var meal;
    for (var i = 0; i < fetchedMeals.length; i++) {
        if (fetchedMeals[i].idMeal === mealID) {
            meal = fetchedMeals[i];
            break;
        }
    }

    if (meal) {
        // Check if the meal is already in the planner
        if (existingMeals.some(function(existingMeal) { return existingMeal.idMeal === mealID; })) {
            alert(meal.strMeal + " is already in your meal planner.");
        } else if (existingMeals.length < 7) { // Check if there are fewer than 7 meals
            existingMeals.push(meal);
            localStorage.setItem('mealPlanner', JSON.stringify(existingMeals));
            alert(meal.strMeal + " has been added to your meal planner.");
        } else {
            alert("You can only add up to 7 meals to your meal planner.");
        }
    }
}