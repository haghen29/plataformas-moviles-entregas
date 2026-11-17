const spinner = document.getElementById("spinner");
const contenedor = document.getElementById("recetas");
const titulo = document.getElementById("titulo");

const nombres = {
  Chinese: "chinas",
  Italian: "italianas",
  American: "americanas"
};

function cargarRecetas(tipo) {
  contenedor.innerHTML = "";
  spinner.style.display = "block";
  titulo.innerText = "Recetas " + nombres[tipo];

  fetch("https://www.themealdb.com/api/json/v1/1/filter.php?a=" + tipo)
    .then(res => res.json())
    .then(data => {
      spinner.style.display = "none";
      data.meals.forEach(receta => {
        contenedor.innerHTML += `
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <div class="card">
              <img src="${receta.strMealThumb}" class="card-img-top">
              <div class="card-body">
                <h5 class="card-title">${receta.strMeal}</h5>
                <button class="btn btn-warning" onclick="verReceta(${receta.idMeal})">Ver receta</button>
              </div>
            </div>
          </div>
        `;
      });
    })
    .catch(err => {
      spinner.style.display = "none";
      contenedor.innerHTML = "<p>Hubo un error cargando las recetas</p>";
      console.log(err);
    });
}

function verReceta(id) {
  const modal = new bootstrap.Modal(document.getElementById("modalReceta"));
  document.getElementById("modalTitulo").innerText = "Cargando...";
  document.getElementById("modalCuerpo").innerHTML = '<div class="spinner-border"></div>';
  modal.show();

  fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id)
    .then(res => res.json())
    .then(data => {
      const receta = data.meals[0];

      // los ingredientes vienen separados en strIngredient1, strIngredient2... hasta 20
      let ingredientes = "";
      for (let i = 1; i <= 20; i++) {
        let ing = receta["strIngredient" + i];
        let medida = receta["strMeasure" + i];
        if (ing && ing.trim() != "") {
          ingredientes += "<li>" + ing + " - " + medida + "</li>";
        }
      }

      document.getElementById("modalTitulo").innerText = receta.strMeal;
      document.getElementById("modalCuerpo").innerHTML = `
        <img src="${receta.strMealThumb}">
        <p><b>Categoria:</b> ${receta.strCategory} | <b>Origen:</b> ${receta.strArea}</p>
        <h5>Ingredientes</h5>
        <ul>${ingredientes}</ul>
        <h5>Pasos</h5>
        <p style="white-space: pre-line">${receta.strInstructions}</p>
      `;
    });
}

// al principio cargo las chinas
cargarRecetas("Chinese");
