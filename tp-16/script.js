// =====================================================================
// script.js - logica del recetario Valpoletano
// usa la API gratuita de TheMealDB (https://www.themealdb.com)
// =====================================================================


// ---------------------------------------------------------------------
// ELEMENTOS DEL HTML
// se guardan en variables los elementos de index.html que se van a usar
// varias veces, asi no hay que buscarlos cada vez.
// getElementById busca un elemento por su atributo id.
// ---------------------------------------------------------------------

// el div con id="spinner" de index.html (el circulito de "Cargando...").
// se muestra mientras se esperan las recetas y se esconde cuando llegan.
const spinner = document.getElementById("spinner");

// el div con id="recetas" de index.html (la fila "row" vacia).
// aca adentro se van agregando las cartas de las recetas.
const contenedor = document.getElementById("recetas");

// el h3 con id="titulo" de index.html.
// su texto se reemplaza por "Recetas chinas", "Recetas italianas" o "Recetas americanas".
const titulo = document.getElementById("titulo");


// ---------------------------------------------------------------------
// TRADUCCION DE NOMBRES
// la API usa los nombres en ingles ("Chinese", "Italian", "United States")
// pero en el titulo de la pagina se muestran en español.
// este objeto relaciona cada nombre de la API con su texto en español.
// ejemplo: nombres["Italian"] devuelve "italianas".
// las americanas se piden como "United States" porque la API no reconoce "American"
// (devuelve meals: null y aparece el mensaje de error).
// ---------------------------------------------------------------------
const nombres = {
  Chinese: "chinas",
  Italian: "italianas",
  "United States": "americanas" // va entre comillas porque tiene un espacio
};


// ---------------------------------------------------------------------
// FUNCION cargarRecetas(tipo)
// trae de la API todas las recetas de un pais y las muestra como cartas.
//
// se ejecuta:
//   - una vez al abrir la pagina con "Chinese" (ultima linea de este archivo)
//   - cada vez que se toca un boton de index.html (Chinas / Italianas / Americanas),
//     que tienen onclick="cargarRecetas('...')"
//
// parametro "tipo": el nombre del pais como lo pide la API ("Chinese", "Italian" o "United States")
// ---------------------------------------------------------------------
function cargarRecetas(tipo) {

  // vacia el div id="recetas" para borrar las cartas del pais anterior
  contenedor.innerHTML = "";

  // muestra el spinner de index.html mientras se espera la respuesta de la API
  spinner.style.display = "block";

  // cambia el texto del h3 id="titulo" de index.html.
  // ejemplo: si tipo es "Italian", queda "Recetas italianas"
  titulo.innerText = "Recetas " + nombres[tipo];

  // fetch hace el pedido a la API. el endpoint "filter.php?a=" filtra por area (pais).
  // ejemplo de URL final: https://www.themealdb.com/api/json/v1/1/filter.php?a=Chinese
  // esta respuesta solo trae nombre, foto e id de cada receta (no ingredientes ni pasos).
  fetch("https://www.themealdb.com/api/json/v1/1/filter.php?a=" + tipo)

    // la respuesta llega como texto; .json() la convierte en un objeto de javascript
    .then(res => res.json())

    // "data" es el objeto ya convertido. tiene la forma: { meals: [ receta1, receta2, ... ] }
    .then(data => {

      // ya llegaron las recetas: se esconde el spinner de index.html
      spinner.style.display = "none";

      // forEach recorre el array de recetas, una por una.
      // "receta" es cada elemento, con estas propiedades de la API:
      //   receta.strMeal       -> nombre de la receta
      //   receta.strMealThumb  -> URL de la foto
      //   receta.idMeal        -> numero de id (se usa para pedir la receta completa)
      data.meals.forEach(receta => {

        // se agrega (+=) una carta al div id="recetas" de index.html.
        // se usa un template string (comillas invertidas ``) para poder
        // meter variables adentro del html con ${...}
        contenedor.innerHTML += `
          <!-- COLUMNA de la grilla de bootstrap. decide cuantas cartas entran por fila:
               col-12    -> en celular ocupa las 12 partes (1 carta por fila)
               col-sm-6  -> en pantalla chica ocupa 6 de 12 (2 cartas por fila)
               col-md-4  -> en pantalla mediana ocupa 4 de 12 (3 cartas por fila)
               col-lg-3  -> en pantalla grande ocupa 3 de 12 (4 cartas por fila) -->
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">

            <!-- CARTA de bootstrap (caja con borde y esquinas redondeadas).
                 la separacion entre cartas se define en style.css (regla ".card") -->
            <div class="card">

              <!-- foto de la receta. "card-img-top" la pone arriba de la carta
                   con las esquinas de arriba redondeadas.
                   el alto fijo de 200px se define en style.css (regla ".card img") -->
              <img src="${receta.strMealThumb}" class="card-img-top">

              <!-- "card-body": parte de abajo de la carta, con margen interno -->
              <div class="card-body">

                <!-- nombre de la receta. "card-title" es el estilo de titulo de carta -->
                <h5 class="card-title">${receta.strMeal}</h5>

                <!-- boton amarillo ("btn-warning") que abre el modal de index.html.
                     al tocarlo ejecuta verReceta() pasandole el id de esta receta -->
                <button class="btn btn-warning" onclick="verReceta(${receta.idMeal})">Ver receta</button>
              </div>
            </div>
          </div>
        `;
      });
    })

    // .catch se ejecuta si algo falla: no hay internet, la API no responde,
    // o "data.meals" viene null (por ejemplo si se pide un pais que la API no tiene)
    .catch(err => {

      // se esconde el spinner para que no quede girando para siempre
      spinner.style.display = "none";

      // en el div id="recetas" se muestra un mensaje de error en lugar de las cartas
      contenedor.innerHTML = "<p>Hubo un error cargando las recetas</p>";

      // el error completo se muestra en la consola del navegador (F12) para poder revisarlo
      console.log(err);
    });
}


// ---------------------------------------------------------------------
// FUNCION verReceta(id)
// abre el modal de index.html (id="modalReceta") y lo llena con la receta completa:
// foto, categoria, origen, ingredientes y pasos.
//
// se ejecuta cuando se toca el boton "Ver receta" de una carta
// (ese boton lo crea cargarRecetas() con onclick="verReceta(id)")
//
// parametro "id": el idMeal de la receta, por ejemplo 52772
// ---------------------------------------------------------------------
function verReceta(id) {

  // crea un objeto Modal de bootstrap a partir del div id="modalReceta" de index.html.
  // "bootstrap" existe porque index.html carga bootstrap.bundle.min.js antes que este archivo.
  const modal = new bootstrap.Modal(document.getElementById("modalReceta"));

  // mientras se espera la receta, el h5 id="modalTitulo" de index.html muestra "Cargando..."
  document.getElementById("modalTitulo").innerText = "Cargando...";

  // y el div id="modalCuerpo" de index.html muestra un spinner de bootstrap
  document.getElementById("modalCuerpo").innerHTML = '<div class="spinner-border"></div>';

  // se abre el modal (aparece en pantalla con la animacion "fade")
  modal.show();

  // el endpoint "filter.php" de cargarRecetas() no trae ingredientes ni pasos,
  // por eso se hace otro pedido a "lookup.php?i=", que busca una receta por su id
  // y devuelve todos sus datos.
  // ejemplo: https://www.themealdb.com/api/json/v1/1/lookup.php?i=52772
  fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id)

    // convierte la respuesta a objeto de javascript
    .then(res => res.json())

    .then(data => {

      // la API devuelve un array "meals" con una sola receta adentro, se toma la primera (posicion 0)
      const receta = data.meals[0];

      // ARMADO DE LA LISTA DE INGREDIENTES
      // la API no da los ingredientes en un array, sino en 20 propiedades separadas:
      //   strIngredient1, strIngredient2, ... strIngredient20  -> nombre del ingrediente
      //   strMeasure1,    strMeasure2,    ... strMeasure20     -> cantidad
      // el for va del 1 al 20 y arma el nombre de cada propiedad sumando el numero.
      // cada ingrediente se agrega como un <li> (item de lista) al string "ingredientes".
      let ingredientes = "";
      for (let i = 1; i <= 20; i++) {

        // receta["strIngredient" + i] es lo mismo que receta.strIngredient1, receta.strIngredient2, etc.
        let ing = receta["strIngredient" + i];
        let medida = receta["strMeasure" + i];

        // muchas recetas tienen menos de 20 ingredientes y el resto viene vacio ("") o null.
        // este if solo agrega el ingrediente si existe y no esta vacio.
        // .trim() saca los espacios, asi un ingrediente " " tambien cuenta como vacio.
        if (ing && ing.trim() != "") {
          ingredientes += "<li>" + ing + " - " + medida + "</li>";
        }
      }

      // el h5 id="modalTitulo" de index.html pasa de "Cargando..." al nombre de la receta
      document.getElementById("modalTitulo").innerText = receta.strMeal;

      // el div id="modalCuerpo" de index.html pasa del spinner al contenido de la receta.
      // propiedades de la API que se usan:
      //   strMealThumb    -> foto (su ancho se define en style.css, regla "#modalCuerpo img")
      //   strCategory     -> categoria (ej: "Chicken", "Dessert")
      //   strArea         -> pais de origen (ej: "Chinese")
      //   strInstructions -> los pasos de preparacion, en un solo texto
      document.getElementById("modalCuerpo").innerHTML = `
        <!-- foto grande de la receta -->
        <img src="${receta.strMealThumb}">

        <!-- categoria y origen. <b> pone el texto en negrita -->
        <p><b>Categoria:</b> ${receta.strCategory} | <b>Origen:</b> ${receta.strArea}</p>

        <!-- lista de ingredientes. <ul> es una lista con puntitos,
             adentro van los <li> armados en el for de arriba -->
        <h5>Ingredientes</h5>
        <ul>${ingredientes}</ul>

        <!-- pasos de preparacion.
             "white-space: pre-line" respeta los saltos de linea que trae el texto de la API,
             asi cada paso aparece en su propio renglon en vez de todo pegado -->
        <h5>Pasos</h5>
        <p style="white-space: pre-line">${receta.strInstructions}</p>
      `;
    });
}


// ---------------------------------------------------------------------
// INICIO
// apenas se abre la pagina se cargan las recetas chinas,
// que es lo que pide el trabajo como listado inicial.
// por eso en index.html el h3 id="titulo" ya arranca diciendo "Recetas chinas"
// y el spinner arranca visible.
// ---------------------------------------------------------------------
cargarRecetas("Chinese");
