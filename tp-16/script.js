// agarro los elementos del html que voy a usar
const spinner = document.getElementById("spinner");
const contenedor = document.getElementById("recetas");
const titulo = document.getElementById("titulo");

// esto es para mostrar el titulo en español segun el tipo de comida
// (las americanas en la api se piden como "United States")
const nombres = {
  Chinese: "chinas",
  Italian: "italianas",
  "United States": "americanas"
};

// trae las recetas de un tipo (Chinese, Italian o United States) y arma las cartas
function cargarRecetas(tipo) {
  contenedor.innerHTML = ""; // borro las cartas que habia antes
  spinner.style.display = "block"; // muestro el spinner mientras carga
  titulo.innerText = "Recetas " + nombres[tipo];

  // le pido a la api las recetas filtradas por pais
  fetch("https://www.themealdb.com/api/json/v1/1/filter.php?a=" + tipo)
    .then(res => res.json()) // paso la respuesta a json
    .then(data => {
      spinner.style.display = "none"; // ya cargo, escondo el spinner

      // por cada receta agrego una carta con la foto, el nombre y el boton
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
      // si algo falla saco el spinner y aviso
      spinner.style.display = "none";
      contenedor.innerHTML = "<p>Hubo un error cargando las recetas</p>";
      console.log(err);
    });
}

// abre el modal con toda la info de una receta (busca por id)
function verReceta(id) {
  const modal = new bootstrap.Modal(document.getElementById("modalReceta"));

  // mientras carga pongo un spinner adentro del modal
  document.getElementById("modalTitulo").innerText = "Cargando...";
  document.getElementById("modalCuerpo").innerHTML = '<div class="spinner-border"></div>';
  modal.show();

  // el filtro de antes no trae los ingredientes ni los pasos, por eso pido la receta completa
  fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id)
    .then(res => res.json())
    .then(data => {
      const receta = data.meals[0]; // la api devuelve un array con una sola receta

      // los ingredientes vienen separados en strIngredient1, strIngredient2... hasta 20
      // y las cantidades en strMeasure1, strMeasure2... asi que los recorro con un for
      let ingredientes = "";
      for (let i = 1; i <= 20; i++) {
        let ing = receta["strIngredient" + i];
        let medida = receta["strMeasure" + i];
        // algunos vienen vacios, esos los salteo
        if (ing && ing.trim() != "") {
          ingredientes += "<li>" + ing + " - " + medida + "</li>";
        }
      }

      // relleno el modal con los datos
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
