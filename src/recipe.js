// Fetch and display recipe details from localStorage
const selectedMeal = JSON.parse(localStorage.getItem('selectedMeal'));

if (selectedMeal) {
  // Display the recipe name, ingredients, instructions, and image
  document.getElementById('recipe-details').innerHTML = `
    <div class="meal-row">
      <div class="meal-name">
        <h3>${selectedMeal.strMeal}</h3>
      </div>
      <div class="meal-ingredients">
        <h4>Ingredients:</h4>
        <ul>
          ${Array.from({ length: 20 }, (_, i) => {
            const ingredient = selectedMeal[`strIngredient${i + 1}`];
            return ingredient ? `<li>${ingredient}</li>` : '';
          }).join('')}
        </ul>
      </div>
    </div>
    <div class="instruction-image-row">
      <div class="instructions">
        <h4>Instructions:</h4>
        <p>${selectedMeal.strInstructions}</p>
      </div>
      <img class="meal-image" src="${selectedMeal.strMealThumb}" alt="${selectedMeal.strMeal}" />
    </div>
    <a class="youtube-link" href="${selectedMeal.strYoutube}" target="_blank">Watch here</a>
  `;
} else {
  document.getElementById('recipe-details').innerHTML = '<p>No recipe found.</p>';
}
