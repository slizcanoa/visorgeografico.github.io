// Crear mapa
var map = L.map('map').setView([4.4233, -73.9394], 17); // Centrado en caqueza, Colombia

//menu desplegable

document.getElementById('select-location').addEventListener('change', function (e) {
  let coords = e.target.value.split(",");
  let zoomLevel = 20; // Nivel de zoom predeterminado

  if (e.target.value === "4.4233,-73.9394") {
    zoomLevel = 17; // Establece el nivel de zoom diferente para "Volver a la vista inicial"
  }

  map.flyTo(coords, zoomLevel);
});


// Agregar capa de mapa base de OpenStreetMap
var openStreetMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 20,
});

// Agregar capa de mapa base de Google Satellite
var googleSatelliteLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  attribution: 'Google Satellite © Google',
  maxZoom: 20,
});

// Agregar escala
L.control.scale({ imperial: false, className: 'custom-scale', position: 'topright', maxWidth: 160 }).addTo(map);


// Agregar CAPA1 en formato GeoJson
suelosJS = L.geoJson(suelos,{
    style: style,
    onEachFeature: onEachFeature
});

// Agregar CAPA2 en formato GeoJson
var cobersuelosJS = L.geoJson(cobersuelos,{
  style: style,
  onEachFeature: onEachFeature
});


// Agregar control para la capa suelos para ver los datos al pasar el puntero

var info = L.control();

// Crear un div con una clase info
info.onAdd = function(map){
    this._div = L.DomUtil.create('div','info');
    this.update();
    return this._div;
};

// Agregar el metodo que actualiza el control segun el puntero vaya pasando
info.update = function(props){
    this._div.innerHTML = (props ? '<b>' + props.TIPO + '</b><br/>Clase: '+ props.UCS + '</b><br/>Litología: '+ props.LITOLOGÍA + '</b><br/>Características: '+ props.CARACTER_1: '<b>'+'Seleccione la Capa'); 
};


// Agregar el control de información al mapa     
 info.addTo(map);

// Función para asignar colores basados en valores
function getColor(d) {
    var colorMap = {
        1: '#CC9900',
        2: '#CCFF00',
        3: '#FF9966',
        4: '#FFFF99',
        5: '#FFCC66',
        6: '#CC9999',
        7: '#FFFF33',
        8: '#CC0000',
        0: '#e8d8ff'
    };
    
    return colorMap[d] || '#ffffff'; // Si d no coincide con ningún valor en el mapeo, devuelve blanco por defecto
}
            

// se crea la funcion para mostrar la simbologia de acuerdo al campo COLO

function style(feature){
    return {
        fillColor: getColor(feature.properties.COLO),
        weight: 3,
        opacity: 0.2,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.3
    };
}


// AGregar interaccion del puntero con la capa para resaltar el objeto
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 4,
        opacity: 1.5,
        color: '#FF6600',
        dashArray: '',
        fillOpacity: 0.4
    });

    info.update(layer.feature.properties);
}

// Configurar los cambios de resaltado y zoom de la capa

var suelosJS;

function resetHighlight(e){
    suelosJS.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e){
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer){
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}



// Agregar CAPA3 en formato GeoJson
   var curvasJS = L.geoJson(curvas,{
   style: function(feature) {
   var color;
      if (feature.properties.ALTURA < 1700) {
         color = '#99FF33';
      } else if (feature.properties.ALTURA < 2000) {
         color = 'yellow';
      } else {
         color = 'orange';
      }
      // asignar un grosor según la longitud
      var weight;
      if (feature.geometry.coordinates.length < 100) {
         weight = 2.5;
      } else if (feature.geometry.coordinates.length < 200) {
         weight = 2.5;
      } else {
         weight = 2.5;
      }
      return {color: color, weight: weight};
      },

      //onEachFeature: function (feature, layer) { // popup a cada feature
      //layer.bindPopup("Altura: " + feature.properties.ALTURA + " m s.n.m.");}});

   onEachFeature: function (feature, layer) { // popup a cada feature
    layer.bindPopup ("Altura: " + feature.properties.ALTURA + " m s.n.m.");
    layer.on ('mouseover', function (e) { // se abre el popup al pasar el puntero
      this.openPopup (e.latlng); // se usa la posición del puntero para abrir el popup
    });
    layer.on ('mousemove', function (e) { // se actualiza el popup al mover el puntero
      this.openPopup (e.latlng); // se usa la posición del puntero para abrir el popup
    });
    layer.on ('mouseout', function (e) { // se cierra el popup al salir el puntero
      this.closePopup ();
    });
    
  }
});


// Definir mapas base disponibles
var baseMaps = {
  "OpenStreetMap": openStreetMapLayer,
  "Google Satellite": googleSatelliteLayer,
};

// Definir capas adicionales
var overlayMaps = {
  "Tipo de suelo": suelosJS,
  "Cobertura del suelo": cobersuelosJS,
  "Curvas de nivel": curvasJS
};


// Agregar control de capas para cambiar entre mapas base y capas adicionales
L.control.layers(baseMaps, overlayMaps).addTo(map);


// Establecer capa de google satellite como la capa inicial
googleSatelliteLayer.addTo(map);



// Crear minimapa
var miniMap = new L.Control.MiniMap(
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18
  }),
  {
    toggleDisplay: true, // Mostrar/ocultar minimapa con un botón
    minimized: false     // Mostrar minimapa expandido por defecto
  }
).addTo(map);

// Crear un controlador de eventos para el movimiento del mouse en el mapa
map.on('mousemove', function (e) {
  var coordinatesElement = document.getElementById('coordinates');

  // Obtener las coordenadas latitud y longitud del evento
  var lat = e.latlng.lat.toFixed(6);
  var lng = e.latlng.lng.toFixed(6);

  // Actualizar el contenido del elemento HTML con las coordenadas
  coordinatesElement.innerHTML = 'Latitud: ' + lat + '<br>Longitud: ' + lng;
});


// Agregar circulos para Pozos

// Pozo 1
var circle = L.circle([4.4218, -73.9472], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4218</b><br>LONGITUD: -73,9472</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1989</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 4 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 1");

// Pozo 2
var circle = L.circle([4.4216, -73.9452], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4216</b><br>LONGITUD: -73,9452</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1982</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 3HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 4 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");


// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 2");

// Pozo 3
var circle = L.circle([4.4232, -73.9438], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4232</b><br>LONGITUD: -73,9438</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1975</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 4 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Piedra acomodada");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 3");

// Pozo 4
var circle = L.circle([4.4236, -73.9440], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4236</b><br>LONGITUD: -73,944</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1950</b><br>MÉTODO DE EXTRACCIÓN: Con Vasija </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 1,5 m</b><br>DIÁMETRO  APROX.: 1 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 4");

// Pozo 5
var circle = L.circle([4.4245, -73.9437], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4245</b><br>LONGITUD: -73,9437</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola</b><br>FECHA DE CONSTRUCCIÓN: 2005</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 4 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Ladrillo");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 5");

// Pozo 6
var circle = L.circle([4.4247, -73.9437], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4247</b><br>LONGITUD: -73,9437</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1999</b><br>MÉTODO DE EXTRACCIÓN: Desnivel </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 1 m</b><br>DIÁMETRO  APROX.: 1 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 6");

// Pozo 7
var circle = L.circle([4.4262, -73.9430], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4262</b><br>LONGITUD: -73,943</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1986</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 3HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 4 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Bloque de cemento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 7");

// Pozo 8
var circle = L.circle([4.4268, -73.9434], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4268</b><br>LONGITUD: -73,9434</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1972</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 3HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 5 m</b><br>DIÁMETRO  APROX.: 2 m</b><br>TIPO DE REVESTIMIENTO: Piedra acomodada");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 8");

// Pozo 9
var circle = L.circle([4.4272, -73.9451], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4272</b><br>LONGITUD: -73,9451</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1997</b><br>MÉTODO DE EXTRACCIÓN: Desnivel </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 2 m</b><br>DIÁMETRO  APROX.: 2 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 9");

// Pozo 10
var circle = L.circle([4.4293, -73.9429], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4293</b><br>LONGITUD: -73,9429</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1996</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 7 m</b><br>DIÁMETRO  APROX.: 2 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 10");

// Pozo 11
var circle = L.circle([4.429, -73.9439], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,429</b><br>LONGITUD: -73,9439</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1985</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 4 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 11");

// Pozo 12
var circle = L.circle([4.4287, -73.9400], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4287</b><br>LONGITUD: -73,94</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1976</b><br>MÉTODO DE EXTRACCIÓN: Desnivel </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 2 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 12");

// Pozo 13
var circle = L.circle([4.4277, -73.9406], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4277</b><br>LONGITUD: -73,9406</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 2006</b><br>MÉTODO DE EXTRACCIÓN: Desnivel </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 2 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 13");

// Pozo 14
var circle = L.circle([4.4271, -73.9405], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4271</b><br>LONGITUD: -73,9405</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 2000</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 3HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 4 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 14");

// Pozo 15
var circle = L.circle([4.4268, -73.9405], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4268</b><br>LONGITUD: -73,9405</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1948</b><br>MÉTODO DE EXTRACCIÓN: Con Vasija </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 1 m</b><br>DIÁMETRO  APROX.: 1 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 15");

// Pozo 16
var circle = L.circle([4.4264, -73.9405], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4264</b><br>LONGITUD: -73,9405</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 2005</b><br>MÉTODO DE EXTRACCIÓN: Motor a Gasolina</b><br>CABALLOS DE FUERZA (MOTOR): 1,5HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 5 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 16");

// Pozo 17
var circle = L.circle([4.426, -73.9418], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,426</b><br>LONGITUD: -73,9418</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1996</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 3HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 8 m</b><br>DIÁMETRO  APROX.: 2,5 m</b><br>TIPO DE REVESTIMIENTO: Ladrillo");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 17");

// Pozo 18
var circle = L.circle([4.4258, -73.9419], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4258</b><br>LONGITUD: -73,9419</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 2004</b><br>MÉTODO DE EXTRACCIÓN: Motor a Gasolina</b><br>CABALLOS DE FUERZA (MOTOR): 1,5HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 6 m</b><br>DIÁMETRO  APROX.: 2,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 18");

// Pozo 19
var circle = L.circle([4.4242, -73.9398], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4242</b><br>LONGITUD: -73,9398</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1954</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 1,5HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 5 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Bloque de cemento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 19");

// Pozo 20
var circle = L.circle([4.4245, -73.9392], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4245</b><br>LONGITUD: -73,9392</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1960</b><br>MÉTODO DE EXTRACCIÓN: Con Vasija </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 1 m</b><br>DIÁMETRO  APROX.: 1 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 20");

// Pozo 21
var circle = L.circle([4.4245, -73.9389], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4245</b><br>LONGITUD: -73,9389</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola</b><br>FECHA DE CONSTRUCCIÓN: 1970</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 7 m</b><br>DIÁMETRO  APROX.: 2,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 21");

// Pozo 22
var circle = L.circle([4.4246, -73.9403], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4246</b><br>LONGITUD: -73,9403</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola</b><br>FECHA DE CONSTRUCCIÓN: 2004</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 1,5HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 6 m</b><br>DIÁMETRO  APROX.: 2 m</b><br>TIPO DE REVESTIMIENTO: Bloque de cemento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 22");

// Pozo 23
var circle = L.circle([4.4246, -73.9392], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4246</b><br>LONGITUD: -73,9392</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1997</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 1,5HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 4 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 23");

// Pozo 24
var circle = L.circle([4.4251, -73.9406], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4251</b><br>LONGITUD: -73,9406</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1964</b><br>MÉTODO DE EXTRACCIÓN: Vasija/Desnivel</b><br>CABALLOS DE FUERZA (MOTOR): N/A</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 1 m</b><br>DIÁMETRO  APROX.: 1 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 24");

// Pozo 25
var circle = L.circle([4.4234, -73.9395], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4234</b><br>LONGITUD: -73,9395</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1948</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 5 m</b><br>DIÁMETRO  APROX.: 2 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 25");

// Pozo 26
var circle = L.circle([4.4222, -73.9376], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4222</b><br>LONGITUD: -73,9376</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1983</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 3HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 8 m</b><br>DIÁMETRO  APROX.: 3 m</b><br>TIPO DE REVESTIMIENTO: Bloque de cemento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 26");

// Pozo 27
var circle = L.circle([4.4208, -73.9381], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4208</b><br>LONGITUD: -73,9381</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1990</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 7 m</b><br>DIÁMETRO  APROX.: 2 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 27");

// Pozo 28
var circle = L.circle([4.4235, -73.9405], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4235</b><br>LONGITUD: -73,9405</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 2002</b><br>MÉTODO DE EXTRACCIÓN: Motor a Gasolina</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 7 m</b><br>DIÁMETRO  APROX.: 2,5 m</b><br>TIPO DE REVESTIMIENTO: Bloque de cemento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 28");

// Pozo 29
var circle = L.circle([4.4224, -73.9379], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4224</b><br>LONGITUD: -73,9379</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1991</b><br>MÉTODO DE EXTRACCIÓN: Motor a Gasolina</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 7 m</b><br>DIÁMETRO  APROX.: 2,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 29");

// Pozo 30
var circle = L.circle([4.4226, -73.9404], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4226</b><br>LONGITUD: -73,9404</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1978</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 3HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 6 m</b><br>DIÁMETRO  APROX.: 2 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 30");

// Pozo 31
var circle = L.circle([4.4233, -73.9404], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4233</b><br>LONGITUD: -73,9404</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1960</b><br>MÉTODO DE EXTRACCIÓN: Con Vasija </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 2 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Piedra acomodada");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 31");

// Pozo 32
var circle = L.circle([4.4220, -73.9407], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,422</b><br>LONGITUD: -73,9407</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola</b><br>FECHA DE CONSTRUCCIÓN: 2009</b><br>MÉTODO DE EXTRACCIÓN: Motor a gasolina</b><br>CABALLOS DE FUERZA (MOTOR): 3HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 4 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Bloque de cemento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 32");

// Pozo 33
var circle = L.circle([4.4210, -73.9412], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,421</b><br>LONGITUD: -73,9412</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1988</b><br>MÉTODO DE EXTRACCIÓN: Motor a Gasolina</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 6 m</b><br>DIÁMETRO  APROX.: 2,5 m</b><br>TIPO DE REVESTIMIENTO: Piedra acomodada");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 33");

// Pozo 34
var circle = L.circle([4.4202, -73.9411], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4202</b><br>LONGITUD: -73,9411</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola</b><br>FECHA DE CONSTRUCCIÓN: 1999</b><br>MÉTODO DE EXTRACCIÓN: Motor a Gasolina</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 5 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Tubo de concreto");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 34");

// Pozo 35
var circle = L.circle([4.4204, -73.9411], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4204</b><br>LONGITUD: -73,9411</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1967</b><br>MÉTODO DE EXTRACCIÓN: Desnivel </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 2 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Piedra acomodada");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 35");

// Pozo 36
var circle = L.circle([4.4216, -73.9381], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4216</b><br>LONGITUD: -73,9381</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1935</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 1,5HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 8 m</b><br>DIÁMETRO  APROX.: 3 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 36");

// Pozo 37
var circle = L.circle([4.4232, -73.9377], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4232</b><br>LONGITUD: -73,9377</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola</b><br>FECHA DE CONSTRUCCIÓN: 2008</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 6 m</b><br>DIÁMETRO  APROX.: 2 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 37");

// Pozo 38
var circle = L.circle([4.4224, -73.9382], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4224</b><br>LONGITUD: -73,9382</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 2002</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 7 m</b><br>DIÁMETRO  APROX.: 2 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 38");

// Pozo 39
var circle = L.circle([4.4209, -73.9388], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4209</b><br>LONGITUD: -73,9388</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1969</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 8 m</b><br>DIÁMETRO  APROX.: 3 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 39");

// Pozo 40
var circle = L.circle([4.4216, -73.9382], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4216</b><br>LONGITUD: -73,9382</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1987</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 3HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 8 m</b><br>DIÁMETRO  APROX.: 4 m</b><br>TIPO DE REVESTIMIENTO: Piedra acomodada");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 40");

// Pozo 41
var circle = L.circle([4.4189, -73.9363], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4189</b><br>LONGITUD: -73,9363</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola</b><br>FECHA DE CONSTRUCCIÓN: 1935</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 7 m</b><br>DIÁMETRO  APROX.: 2,5 m</b><br>TIPO DE REVESTIMIENTO: Ladrillo");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 41");

// Pozo 42
var circle = L.circle([4.4195, -73.9366], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4195</b><br>LONGITUD: -73,9366</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola</b><br>FECHA DE CONSTRUCCIÓN: 1999</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 4 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 42");

// Pozo 43
var circle = L.circle([4.4228, -73.9353], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4228</b><br>LONGITUD: -73,9353</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1943</b><br>MÉTODO DE EXTRACCIÓN: Vasija/Desnivel</b><br>CABALLOS DE FUERZA (MOTOR): N/A</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 1 m</b><br>DIÁMETRO  APROX.: 1 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 43");

// Pozo 44
var circle = L.circle([4.4224, -73.9355], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4224</b><br>LONGITUD: -73,9355</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola</b><br>FECHA DE CONSTRUCCIÓN: 1968</b><br>MÉTODO DE EXTRACCIÓN: Motor a Gasolina</b><br>CABALLOS DE FUERZA (MOTOR): 3HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 4 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 44");

// Pozo 45
var circle = L.circle([4.4234, -73.9351], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4234</b><br>LONGITUD: -73,9351</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1971</b><br>MÉTODO DE EXTRACCIÓN: Vasija/Desnivel</b><br>CABALLOS DE FUERZA (MOTOR): N/A</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 1 m</b><br>DIÁMETRO  APROX.: 1 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 45");

// Pozo 46
var circle = L.circle([4.4239, -73.931], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4239</b><br>LONGITUD: -73,931</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 2006</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 1,5HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 8 m</b><br>DIÁMETRO  APROX.: 3 m</b><br>TIPO DE REVESTIMIENTO: Tubo de concreto");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 46");

// Pozo 47
var circle = L.circle([4.4214, -73.932], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4214</b><br>LONGITUD: -73,932</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola</b><br>FECHA DE CONSTRUCCIÓN: 2001</b><br>MÉTODO DE EXTRACCIÓN: Motor a Gasolina</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 8 m</b><br>DIÁMETRO  APROX.: 2,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 47");

// Pozo 48
var circle = L.circle([4.4250, -73.9333], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,425</b><br>LONGITUD: -73,9333</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1998</b><br>MÉTODO DE EXTRACCIÓN: Desnivel </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 1,5 m</b><br>DIÁMETRO  APROX.: 1 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 48");

// Pozo 49
var circle = L.circle([4.423, -73.9383], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,423</b><br>LONGITUD: -73,9383</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 2006</b><br>MÉTODO DE EXTRACCIÓN: Desnivel </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 1,5 m</b><br>DIÁMETRO  APROX.: 1 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 49");

// Pozo 50
var circle = L.circle([4.4239, -73.9384], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4239</b><br>LONGITUD: -73,9384</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1993</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 3HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 4 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 50");

// Pozo 51
var circle = L.circle([4.4236, -73.9383], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4236</b><br>LONGITUD: -73,9383</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola</b><br>FECHA DE CONSTRUCCIÓN: 1986</b><br>MÉTODO DE EXTRACCIÓN: Motor a Gasolina</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 6 m</b><br>DIÁMETRO  APROX.: 2 m</b><br>TIPO DE REVESTIMIENTO: Piedra acomodada");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 51");

// Pozo 52
var circle = L.circle([4.4245, -73.9377], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4245</b><br>LONGITUD: -73,9377</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola</b><br>FECHA DE CONSTRUCCIÓN: 1983</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 1,5HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 7 m</b><br>DIÁMETRO  APROX.: 2 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 52");

// Pozo 53
var circle = L.circle([4.4247, -73.9369], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4247</b><br>LONGITUD: -73,9369</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1947</b><br>MÉTODO DE EXTRACCIÓN: Desnivel </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 2 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Piedra acomodada");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 53");

// Pozo 54
var circle = L.circle([4.4269, -73.9334], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4269</b><br>LONGITUD: -73,9334</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1990</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 3HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 6 m</b><br>DIÁMETRO  APROX.: 2 m</b><br>TIPO DE REVESTIMIENTO: Tubo de concreto");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 54");

// Pozo 55
var circle = L.circle([4.4271, -73.9325], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4271</b><br>LONGITUD: -73,9325</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola</b><br>FECHA DE CONSTRUCCIÓN: 2001</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 3HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 5 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 55");

// Pozo 56
var circle = L.circle([4.4265, -73.9330], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4265</b><br>LONGITUD: -73,933</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola</b><br>FECHA DE CONSTRUCCIÓN: 2020</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 3HP</b><br>TIPO DE CAPTACIÓN: Pozo Profundo</b><br>TIPO DE EXCAVACIÓN: Con barrena</b><br>PROFUNDIDAD APROX.: 22 m</b><br>DIÁMETRO  APROX.: 0,5 m</b><br>TIPO DE REVESTIMIENTO: Tubo PVC");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 56");

// Pozo 57
var circle = L.circle([4.4267, -73.9340], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4267</b><br>LONGITUD: -73,934</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1993</b><br>MÉTODO DE EXTRACCIÓN: Desnivel </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 2 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 57");

// Pozo 58
var circle = L.circle([4.4263, -73.9343], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4263</b><br>LONGITUD: -73,9343</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola</b><br>FECHA DE CONSTRUCCIÓN: 2005</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 4 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 58");

// Pozo 59
var circle = L.circle([4.4181, -73.9397], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4181</b><br>LONGITUD: -73,9397</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 2003</b><br>MÉTODO DE EXTRACCIÓN: Con Vasija </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 2 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 59");

// Pozo 60
var circle = L.circle([4.4166, -73.9382], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4166</b><br>LONGITUD: -73,9382</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 2004</b><br>MÉTODO DE EXTRACCIÓN: Motor a Gasolina</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 4 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 60");

// Pozo 61
var circle = L.circle([4.4142, -73.9379], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4142</b><br>LONGITUD: -73,9379</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1993</b><br>MÉTODO DE EXTRACCIÓN: Desnivel </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 2 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 61");

// Pozo 62
var circle = L.circle([4.4171, -73.9355], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4171</b><br>LONGITUD: -73,9355</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 2001</b><br>MÉTODO DE EXTRACCIÓN: Desnivel </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 1,5 m</b><br>DIÁMETRO  APROX.: 1 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 62");

// Pozo 63
var circle = L.circle([4.4153, -73.9354], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4153</b><br>LONGITUD: -73,9354</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 2007</b><br>MÉTODO DE EXTRACCIÓN: Desnivel </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 1,5 m</b><br>DIÁMETRO  APROX.: 1 m</b><br>TIPO DE REVESTIMIENTO: Piedra acomodada");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 63");

// Pozo 64
var circle = L.circle([4.4198, -73.9471], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4198</b><br>LONGITUD: -73,9471</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola</b><br>FECHA DE CONSTRUCCIÓN: 2005</b><br>MÉTODO DE EXTRACCIÓN: Motor a Gasolina</b><br>CABALLOS DE FUERZA (MOTOR): 1,5HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 6 m</b><br>DIÁMETRO  APROX.: 2,5 m</b><br>TIPO DE REVESTIMIENTO: Tubo de concreto");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 64");

// Pozo 65
var circle = L.circle([4.4213, -73.9361], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4213</b><br>LONGITUD: -73,9361</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1936</b><br>MÉTODO DE EXTRACCIÓN: Con Vasija </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 1 m</b><br>DIÁMETRO  APROX.: 1 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 65");

// Pozo 66
var circle = L.circle([4.4216, -73.9361], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4216</b><br>LONGITUD: -73,9361</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1942</b><br>MÉTODO DE EXTRACCIÓN: Desnivel </b><br>CABALLOS DE FUERZA (MOTOR): NA</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 1 m</b><br>DIÁMETRO  APROX.: 1 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 66");

// Pozo 67
var circle = L.circle([4.4217, -73.9362], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4217</b><br>LONGITUD: -73,9362</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1938</b><br>MÉTODO DE EXTRACCIÓN: Vasija/Desnivel</b><br>CABALLOS DE FUERZA (MOTOR): N/A</b><br>TIPO DE CAPTACIÓN: Manantial</b><br>TIPO DE EXCAVACIÓN: Manual</b><br>PROFUNDIDAD APROX.: 1 m</b><br>DIÁMETRO  APROX.: 1 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 67");

// Pozo 68
var circle = L.circle([4.4232, -73.9421], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4232</b><br>LONGITUD: -73,9421</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola</b><br>FECHA DE CONSTRUCCIÓN: 1986</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 1,5HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 6 m</b><br>DIÁMETRO  APROX.: 2 m</b><br>TIPO DE REVESTIMIENTO: Sin revestimiento");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 68");

// Pozo 69
var circle = L.circle([4.4234, -73.9424], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4234</b><br>LONGITUD: -73,9424</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 1994</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Aljibe</b><br>TIPO DE EXCAVACIÓN: Con excavadora</b><br>PROFUNDIDAD APROX.: 4 m</b><br>DIÁMETRO  APROX.: 1,5 m</b><br>TIPO DE REVESTIMIENTO: Ladrillo");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 69");

// Pozo 70
var circle = L.circle([4.4234, -73.9421], {
 color: '#33CCFF',
 fillColor: '#3361FF',
 fillOpacity: 0.5,
  radius: 8
}).addTo(map);

// Agregar información detallada al hacer clic en el círculo
circle.bindPopup("<b>Coordenadas:</b><br>LATITUD: 4,4234</b><br>LONGITUD: -73,9421</b><br></b><br><b>Ubicación:</b><br>MUNICIPIO: Cáqueza</b><br>VEREDA: Girón de Resguardo</b><br></b><br><b>Información detallada del Pozo:</b><br>USO PRINCIPAL: Agrícola, Doméstico</b><br>FECHA DE CONSTRUCCIÓN: 2019</b><br>MÉTODO DE EXTRACCIÓN: Electrobomba Centrífuga</b><br>CABALLOS DE FUERZA (MOTOR): 2HP</b><br>TIPO DE CAPTACIÓN: Pozo Profundo</b><br>TIPO DE EXCAVACIÓN: Con barrena</b><br>PROFUNDIDAD APROX.: 25 m</b><br>DIÁMETRO  APROX.: 0,5 m</b><br>TIPO DE REVESTIMIENTO: Tubo PVC");

// Agregar mensaje al pasar el cursor sobre el círculo
circle.bindTooltip("Pozo 70")//.openTooltip();


////////////////
