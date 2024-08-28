function iniciarAPP() {

    const resultado = document.querySelector('#resultado');

    const selectCategorias = document.querySelector('#categorias');

    //Le agregamos un if porque al cambiar a la parte de favoritas, busca un select y no lo encuentra, por ende agregamos el if, que diga que si ve un select ejecute de caso contrario no haga nada
    if (selectCategorias) {
        selectCategorias.addEventListener('change', seleccionarCategoria);
        obtenerCategorias();
    }
    const favoritosDiv = document.querySelector('.favoritos');
    if (favoritosDiv) {
        obtenerFavoritos();
    }

    // como segunda opcion las opciones para tomar ese modal, en este caso un objeto vacio
    const modal = new bootstrap.Modal('#modal', {})

    

    function obtenerCategorias() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultados => mostrarCategorias(resultados.categories))
    }
    
    function mostrarCategorias(categorias = []) {
        categorias.forEach(categoria => {

            const { strCategory } = categoria;

            const option = document.createElement('OPTION');
            option.value = strCategory
            option.textContent = strCategory
            
            selectCategorias.appendChild(option);
            
            
        })
    };

    function seleccionarCategoria(e) {
        categoria = e.target.value;

        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetas(resultado.meals))

    }

    function mostrarRecetas(recetas = []) {

        limpiarHtml(resultado);

        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-blacl', 'my-5');
        heading.textContent = recetas.length ? 'Resultados' : 'No Hay Resultados';
        resultado.appendChild(heading);
        
        //iterar en los resultados
        recetas.forEach(receta => {
            const { idMeal, strMeal, strMealThumb } = receta;

            const recetaContenedor = document.createElement('DIV');
            recetaContenedor.classList.add('col-md-4');

            const recetaCard = document.createElement('DIV');
            recetaCard.classList.add('card', 'mb-4');

            const recetaImagen = document.createElement('IMG');
            recetaImagen.classList.add('card-img-top');
            //El ?? Nullish coalescing que si un valor es undefined o null pasa lo que esta despues del mismo
            recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.titulo}`
            recetaImagen.src = strMealThumb ?? receta.img;

            const recetaCardBody = document.createElement('DIV');
            recetaCardBody.classList.add('card-body');

            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal ?? receta.titulo;

            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn', 'btn-danger', 'w-100');
            recetaButton.textContent = 'Ver Receta';
            // recetaButton.dataset.bsTarget = "#modal";
            // recetaButton.dataset.bsToggle = "modal";

            /*
            Recordamos .onclick porque como no se ha generadoe el html en el DOM no funcionaria .addEventListener
            Hay que dejarlo como callback para que espere que ocurra el evento
            no dejaro asi recetaButton.onclick = seleccionarReceta(idMeal); esto genera errores
            */
            recetaButton.onclick = function () {
                seleccionarReceta(idMeal ?? receta.id);
            }

            //Inyectar en el codigo HTML

            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard);

            resultado.appendChild(recetaContenedor);
        })
    
    }

    //Funcion para que el boton de receta tome el id
    function seleccionarReceta(id) {
        
        url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetaModal(resultado.meals[0]));
    }

    function mostrarRecetaModal(receta) {
        
        const { idMeal, strInstructions, strMeal, strMealThumb } = receta;

        //Añadir contenido al modal
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = `${strMeal}`
        modalBody.innerHTML = `
        <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}"/>
        <h3 class="my-3">Instrucciones</h3>
        <p>${strInstructions}</p>
        <h3 class="my-3">Ingredientes y Cantidades</h3>

        `

        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');

        //Mostrar cantidades e ingredientes
        for (let i = 1; i <= 20; i++) {
            if (receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredienteLi = document.createElement('LI');
                ingredienteLi.classList.add('list-group-item');
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`

                listGroup.appendChild(ingredienteLi);
            }
        }

        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer');
        limpiarHtml(modalFooter);


        //Botones de cerrar y favorito
        const btnFavorito = document.createElement('BUTTON');
        btnFavorito.classList.add('btn', 'btn-danger', 'col');
        btnFavorito.textContent = existeStorage(idMeal)? 'Eliminar Favorito' : 'Guardar Favorito';

        //LocalStorage
        btnFavorito.onclick = function () {

            //Si exite el idMeal se retorna de manera uq e no se llame la funcion agregar favotito
            if (existeStorage(idMeal)) {
                eliminarFavorito(idMeal);
                btnFavorito.textContent = 'Guardar Favorito';
                mostrarToast('Eliminado Correctamente');
                actualizarFavoritos();
                return;
            }

            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                img: strMealThumb
            });
            btnFavorito.textContent = 'Eliminar Favorito';
            mostrarToast('Agregado Correctamente');


        }

        const btnCerrarModal = document.createElement('BUTTON');
        btnCerrarModal.classList.add('btn', 'btn-secondary', 'col');
        btnCerrarModal.textContent = 'Cerrar';
        btnCerrarModal.onclick = function () {
            modal.hide();
        }
        

        modalFooter.appendChild(btnFavorito);
        modalFooter.appendChild(btnCerrarModal);


        //Muestra el modal
        modal.show();
    }

    function agregarFavorito(receta) {
        //En caso de que la expresiond ela izquierda marque null aplica lo del lado derecho exprecionIzquierda ?? expresionDER
        //Con JSON.parse se convierte en string
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]))

    }

    function eliminarFavorito(id) {

        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
    }

    function existeStorage(id) {

        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        //.some retorna un true de un array
        return favoritos.some(favorito => favorito.id === id);
        
    }

    function mostrarToast(mensaje) {
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;
        toast.show();
    }

    function obtenerFavoritos() {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        if (favoritos.length) {
            mostrarRecetas(favoritos);
            return
        }

        const noFavoritos = document.createElement('P');
        noFavoritos.textContent = 'No hay favoritos aun';
        noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
        resultado.appendChild(noFavoritos);

    
    }

    //Actualizar Favoritos al Eliminar una receta

    function actualizarFavoritos() {
        if (document.getElementsByTagName('h2')[0].textContent === 'Favoritos') {
            location.reload()
            

            // resultado.removeChild('h3'.textContent=nombreReceta)
        } 
    }


    

    //Asi la hacemos pas dinamica
    function limpiarHtml(selector) {
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }
    }
}

document.addEventListener('DOMContentLoaded', iniciarAPP);
