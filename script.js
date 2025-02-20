document.addEventListener("DOMContentLoaded", function () {
    let preguntas = [];
    let paginaActual = 0;
    const preguntasPorPagina = 25;

    async function cargarPreguntas() {
        try {
            const response = await fetch("preguntas_con_imagenes.json");
            preguntas = await response.json();
            mostrarPreguntas();
        } catch (error) {
            console.error("Error cargando las preguntas:", error);
        }
    }

    function mostrarPreguntas() {
        const contenedor = document.getElementById("contenedor-preguntas");
        contenedor.innerHTML = "";

        const inicio = paginaActual * preguntasPorPagina;
        const fin = inicio + preguntasPorPagina;
        const preguntasPagina = preguntas.slice(inicio, fin);

        preguntasPagina.forEach((pregunta, index) => {
            let preguntaHTML = `<div class="pregunta" style="text-align: justify; font-weight: bold; font-size: 18px; margin-bottom: 50px; padding: 20px; border-bottom: 3px solid #ddd; background-color: #f4f4f4; border-radius: 10px;">${pregunta.pregunta.replace(/\n/g, "<br>")}</div>`;

            // Determinar si es selección única o múltiple
            const esMultiple = pregunta.respuestas_correctas.length > 1;
            const tipoInput = esMultiple ? "checkbox" : "radio";

            // Mostrar imágenes de la pregunta
            if (pregunta.imagenes && pregunta.imagenes.length > 0) {
                pregunta.imagenes.forEach(img => {
                    let imgUrl = `${img.url}?t=${Date.now()}`;
                    preguntaHTML += `<img src="${imgUrl}" alt="Imagen relacionada" onerror="console.error('No se pudo cargar:', this.src); this.style.display='none'" style="max-width:100%; border-radius: 8px; margin-top: 15px; display: block;">`;
                });
            }

            preguntaHTML += `<div class="opciones" style="margin-top: 20px;">`;
            pregunta.opciones.forEach((opcion) => {
                let imagenOpcion = "";
                if (pregunta.imagenes) {
                    const imagen = pregunta.imagenes.find(img => img.respuesta.trim().toUpperCase() === opcion.trim().charAt(0));
                    if (imagen) {
                        let imgOpcionUrl = `${imagen.url}?t=${Date.now()}`;
                        imagenOpcion = `<img src="${imgOpcionUrl}" alt="Imagen opción ${opcion.charAt(0)}" onerror="console.error('No se pudo cargar:', this.src); this.style.display='none'" style="max-width:100%; margin-top: 10px; display: block;">`;
                    }
                }

                preguntaHTML += `
                    <label class="opcion" style="display: flex; align-items: center; padding: 20px; border: 2px solid #ccc; border-radius: 8px; margin: 15px 0; background-color: #ffffff; cursor: pointer;" onclick="toggleSeleccion(this, '${opcion}', ${inicio + index}, '${tipoInput}')">
                        <input type="${tipoInput}" name="respuesta${inicio + index}" value="${opcion}" style="margin-right: 15px;">
                        <span style="flex: 1;">${opcion}</span>
                        ${imagenOpcion}
                    </label>`;
            });
            preguntaHTML += `</div>`;
            contenedor.innerHTML += preguntaHTML;
        });

        document.getElementById("pagina-info").textContent = `Página ${paginaActual + 1} de ${Math.ceil(preguntas.length / preguntasPorPagina)}`;
        document.getElementById("anterior").disabled = paginaActual === 0;
        document.getElementById("siguiente").disabled = fin >= preguntas.length;
    }

    window.toggleSeleccion = function (elemento, opcionSeleccionada, index, tipoInput) {
        const pregunta = preguntas[index];
        const respuestasCorrectas = pregunta.respuestas_correctas.map(r => r.trim().toUpperCase());
        const seleccion = opcionSeleccionada.charAt(0).toUpperCase();
        const input = elemento.querySelector("input");

        if (tipoInput === "radio") {
            document.querySelectorAll(`[name='respuesta${index}']`).forEach(el => {
                el.parentNode.style.backgroundColor = "#ffffff";
                el.parentNode.style.color = "black";
            });
        }

        if (input.checked) {
            if (respuestasCorrectas.includes(seleccion)) {
                elemento.style.backgroundColor = "#2ecc71"; // Verde para correcta
                elemento.style.color = "white";
            } else {
                elemento.style.backgroundColor = "#e74c3c"; // Rojo para incorrecta
                elemento.style.color = "white";
            }
        } else {
            elemento.style.backgroundColor = "#ffffff"; // Volver al color original
            elemento.style.color = "black";
        }
    };

    document.getElementById("anterior").addEventListener("click", function () {
        if (paginaActual > 0) {
            paginaActual--;
            mostrarPreguntas();
        }
    });

    document.getElementById("siguiente").addEventListener("click", function () {
        if ((paginaActual + 1) * preguntasPorPagina < preguntas.length) {
            paginaActual++;
            mostrarPreguntas();
        }
    });

    cargarPreguntas();
});
