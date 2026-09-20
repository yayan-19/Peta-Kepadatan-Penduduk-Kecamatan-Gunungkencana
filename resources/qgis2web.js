// Koordinat Tampilan Awal Peta
var initialExtent = [105.818460, -6.697152, 106.297101, -6.522048];

var map = new ol.Map({
    target: 'map',
    renderer: 'canvas',
    layers: layersList,
    view: new ol.View({
        constrainResolution: true,
        maxZoom: 28,
        minZoom: 1,
        rotation: 0, // Mengunci peta selalu mengarah ke Utara
        enableRotation: false, // Mematikan opsi rotasi peta
        projection: new ol.proj.Projection({
            code: 'EPSG:4326',
            units: 'degrees'
        })
    })
});

// Fit ke Tampilan Awal
map.getView().fit(initialExtent, map.getSize());

// Menyembunyikan Layar Loading saat Peta Selesai Dimuat
map.once('rendercomplete', function() {
    var loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(function() {
            loadingScreen.style.display = 'none';
        }, 500);
    }
});

// Perubahan Kursor Pointer
function pointerOnFeature(evt) {
    if (evt.dragging) {
        return;
    }
    var hasFeature = map.hasFeatureAtPixel(evt.pixel, {
        layerFilter: function(layer) {
            return layer && (layer.get("interactive"));
        }
    });
    map.getViewport().style.cursor = hasFeature ? "pointer" : "";
}
map.on('pointermove', pointerOnFeature);

function styleCursorMove() {
    map.on('pointerdrag', function() {
        map.getViewport().style.cursor = "move";
    });
    map.on('pointerup', function() {
        map.getViewport().style.cursor = "default";
    });
}
styleCursorMove();

// Container Kontrol Utama
var topLeftContainer = new ol.control.Control({
    element: (() => {
        var el = document.createElement('div');
        el.id = 'top-left-container';
        return el;
    })(),
});
map.addControl(topLeftContainer);

var bottomLeftContainer = new ol.control.Control({
    element: (() => {
        var el = document.createElement('div');
        el.id = 'bottom-left-container';
        return el;
    })(),
});
map.addControl(bottomLeftContainer);

var topRightContainer = new ol.control.Control({
    element: (() => {
        var el = document.createElement('div');
        el.id = 'top-right-container';
        return el;
    })(),
});
map.addControl(topRightContainer);

var bottomRightContainer = new ol.control.Control({
    element: (() => {
        var el = document.createElement('div');
        el.id = 'bottom-right-container';
        return el;
    })(),
});
map.addControl(bottomRightContainer);

// Tombol Home (Kembali ke Tampilan Awal)
var homeButton = document.createElement('div');
homeButton.className = 'ol-control ol-home-button';
homeButton.innerHTML = '<button title="Kembali ke Tampilan Awal"><i class="fas fa-home"></i></button>';
homeButton.onclick = function() {
    map.getView().fit(initialExtent, {
        duration: 800
    });
};
map.addControl(new ol.control.Control({ element: homeButton }));

// Popup & Overlay
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

function stopMediaInPopup() {
    var mediaElements = container.querySelectorAll('audio, video');
    mediaElements.forEach(function(media) {
        media.pause();
        media.currentTime = 0;
    });
}

closer.onclick = function() {
    container.style.display = 'none';
    closer.blur();
    stopMediaInPopup();
    if (featureOverlay) {
        featureOverlay.getSource().clear(); // Menghapus highlight kuning saat popup ditutup
    }
    return false;
};

var overlayPopup = new ol.Overlay({
    element: container,
    autoPan: true
});
map.addOverlay(overlayPopup);

// Layer Khusus untuk Highlight Warna Kuning
var collection = new ol.Collection();
var featureOverlay = new ol.layer.Vector({
    map: map,
    source: new ol.source.Vector({
        features: collection,
        useSpatialIndex: false
    }),
    updateWhileAnimating: true,
    updateWhileInteracting: true
});

function createPopupField(currentFeature, currentFeatureKeys, layer) {
    var popupText = '';
    for (var i = 0; i < currentFeatureKeys.length; i++) {
        if (currentFeatureKeys[i] != 'geometry' &&
            currentFeatureKeys[i] != 'layerObject' &&
            currentFeatureKeys[i] != 'idO' &&
            currentFeatureKeys[i] != '_mvtLayer_') {
            var popupField = '';
            if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "hidden field") {
                continue;
            } else if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label - visible with data") {
                if (currentFeature.get(currentFeatureKeys[i]) == null) continue;
            }
            if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label - always visible" ||
                layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label - visible with data") {
                popupField += '<th>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + '</th><td>';
            } else {
                popupField += '<td colspan="2">';
            }
            if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label - visible with data") {
                if (currentFeature.get(currentFeatureKeys[i]) == null) continue;
            }
            if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label - always visible" ||
                layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label - visible with data") {
                popupField += '<strong>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + '</strong><br />';
            }
            if (layer.get('fieldImages')[currentFeatureKeys[i]] != "ExternalResource") {
                popupField += (currentFeature.get(currentFeatureKeys[i]) != null ? autolinker.link(currentFeature.get(currentFeatureKeys[i]).toLocaleString()) + '</td>' : '');
            } else {
                var fieldValue = currentFeature.get(currentFeatureKeys[i]);
                if (/\.(gif|jpg|jpeg|tif|tiff|png|avif|webp|svg)$/i.test(fieldValue)) {
                    popupField += (fieldValue != null ? '<img src="images/' + fieldValue.replace(/[\\\/:]/g, '_').trim() + '" /></td>' : '');
                } else if (/\.(mp4|webm|ogg|avi|mov|flv)$/i.test(fieldValue)) {
                    popupField += (fieldValue != null ? '<video controls><source src="images/' + fieldValue.replace(/[\\\/:]/g, '_').trim() + '" type="video/mp4"></video></td>' : '');
                } else if (/\.(mp3|wav|ogg|aac|flac)$/i.test(fieldValue)) {
                    popupField += (fieldValue != null ? '<audio controls><source src="images/' + fieldValue.replace(/[\\\/:]/g, '_').trim() + '" type="audio/mpeg"></audio></td>' : '');
                } else {
                    popupField += (fieldValue != null ? autolinker.link(fieldValue.toLocaleString()) + '</td>' : '');
                }
            }
            popupText += '<tr>' + popupField + '</tr>';
        }
    }
    return popupText;
}

var autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});
var popupContent = '';
var popupCoord = null;

function updatePopup() {
    if (popupContent) {
        content.innerHTML = popupContent;
        container.style.display = 'block';
        overlayPopup.setPosition(popupCoord);
    } else {
        container.style.display = 'none';
        closer.blur();
        stopMediaInPopup();
    }
} 

// Event Klik untuk Membuka Popup dan Mengubah Warna Objek Menjadi KUNING
function onSingleClickFeatures(evt) {
    var pixel = map.getEventPixel(evt.originalEvent);
    var coord = evt.coordinate;
    var currentFeature;
    var currentFeatureKeys;
    var clusteredFeatures;
    var popupText = '<ul>';
    
    // Reset highlight kuning sebelumnya
    if (featureOverlay) {
        featureOverlay.getSource().clear();
    }
    
    map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        if (layer && feature instanceof ol.Feature && (layer.get("interactive") || layer.get("interactive") === undefined)) {
            
            // --- WARNA KUNING SAAT DIKLIK ---
            currentFeature = feature;
            clusteredFeatures = feature.get("features");
            
            var featureStyle;
            if (typeof clusteredFeatures == "undefined") {
                var style = layer.getStyle();
                var styleFunction = typeof style === 'function' ? style : function() { return style; };
                featureStyle = styleFunction(currentFeature)[0];
            } else {
                featureStyle = layer.getStyle().toString();
            }

            var highlightStyle;
            var geomType = currentFeature.getGeometry().getType();

            if (geomType == 'Point' || geomType == 'MultiPoint') {
                var radius = 8;
                if (featureStyle && typeof featureStyle.getImage === 'function' && featureStyle.getImage()) {
                    radius = featureStyle.getImage().getRadius() || 8;
                }
                highlightStyle = new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 255, 0, 1.00)' // Kuning
                        }),
                        radius: radius
                    })
                });
            } else if (geomType == 'LineString' || geomType == 'MultiLineString') {
                var featureWidth = 3;
                if (featureStyle && typeof featureStyle.getStroke === 'function' && featureStyle.getStroke()) {
                    featureWidth = featureStyle.getStroke().getWidth() || 3;
                }
                highlightStyle = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'rgba(255, 255, 0, 1.00)', // Kuning
                        width: featureWidth
                    })
                });
            } else {
                // Polygon / MultiPolygon
                highlightStyle = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 0, 1.00)' // Kuning
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#000000',
                        width: 1
                    })
                });
            }

            // Terapkan highlight kuning ke peta
            featureOverlay.getSource().addFeature(currentFeature);
            featureOverlay.setStyle(highlightStyle);
            // --------------------------------

            // Pembuatan Isi Popup
            var doPopup = false;
            for (var k in layer.get('fieldImages')) {
                if (layer.get('fieldImages')[k] !== "Hidden") {
                    doPopup = true;
                }
            }

            if (typeof clusteredFeatures !== "undefined") {
                if (doPopup) {
                    for(var n = 0; n < clusteredFeatures.length; n++) {
                        currentFeature = clusteredFeatures[n];
                        currentFeatureKeys = currentFeature.getKeys();
                        popupText += '<li><table>';
                        popupText += '<a><b>' + layer.get('popuplayertitle') + '</b></a>';
                        popupText += createPopupField(currentFeature, currentFeatureKeys, layer);
                        popupText += '</table></li>';    
                    }
                }
            } else {
                currentFeatureKeys = currentFeature.getKeys();
                if (doPopup) {
                    popupText += '<li><table>';
                    popupText += '<a><b>' + layer.get('popuplayertitle') + '</b></a>';
                    popupText += createPopupField(currentFeature, currentFeatureKeys, layer);
                    popupText += '</table></li>';
                }
            }
        }
    }, { hitTolerance: 10 }); // Toleransi sentuhan jari di HP (10px)

    if (popupText === '<ul>') {
        popupText = '';
    } else {
        popupText += '</ul>';
    }
    
    popupContent = popupText;
    popupCoord = coord;
    updatePopup();
}

map.on('singleclick', onSingleClickFeatures);

// Layer Switcher Control
var layerSwitcher = new ol.control.LayerSwitcher({
    tipLabel: "Layers",
    target: 'top-right-container'
});
map.addControl(layerSwitcher);

// Kontrol Atribusi (Teks qgis2web, OpenLayers, & QGIS dihapus secara permanen)
var bottomAttribution = new ol.control.Attribution({
  collapsible: false,
  collapsed: false,
  className: 'bottom-attribution'
});
map.addControl(bottomAttribution);

map.once('rendercomplete', function() {
  var bottomAttributionUl = bottomAttribution.element.querySelector('ul');
  if (bottomAttributionUl) {
    var layerAttrs = Array.from(bottomAttributionUl.querySelectorAll('li'))
      .map(function(li) { return li.innerHTML.trim(); }).filter(Boolean);
    var attribHtml = ``; // Kosong permanen
    if (layerAttrs.length > 0) { attribHtml += layerAttrs.join(', '); }
    bottomAttributionUl.innerHTML = '<li>' + attribHtml + '</li>';
  }
});

// Mengatur Posisi Kontrol
var topLeftContainerDiv = document.getElementById('top-left-container');
var bottomLeftContainerDiv = document.getElementById('bottom-left-container');
var bottomRightContainerDiv = document.getElementById('bottom-right-container');

var zoomControl = document.getElementsByClassName('ol-zoom')[0];
if (zoomControl) {
    topLeftContainerDiv.appendChild(zoomControl);
}
var scaleLineControl = document.getElementsByClassName('ol-scale-line')[0];
if (scaleLineControl) {
    scaleLineControl.className += ' ol-control';
    bottomLeftContainerDiv.appendChild(scaleLineControl);
}
var attributionControl = document.getElementsByClassName('bottom-attribution')[0];
if (attributionControl) {
    bottomRightContainerDiv.appendChild(attributionControl);
}