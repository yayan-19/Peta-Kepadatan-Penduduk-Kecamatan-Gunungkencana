ol.proj.proj4.register(proj4);
//ol.proj.get("EPSG:4326").setExtent([105.818460, -6.697152, 106.297101, -6.522048]);
var wms_layers = [];


        var lyr_GoogleSatelliteHybrid_0 = new ol.layer.Tile({
            'title': 'Google Satellite Hybrid',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: ' ',
                url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
            })
        });

        var lyr_GoogleSatellite_1 = new ol.layer.Tile({
            'title': 'Google Satellite',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: ' ',
                url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
            })
        });
var format_KepadatanPendudukGunungkencana_2 = new ol.format.GeoJSON();
var features_KepadatanPendudukGunungkencana_2 = format_KepadatanPendudukGunungkencana_2.readFeatures(json_KepadatanPendudukGunungkencana_2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:4326'});
var jsonSource_KepadatanPendudukGunungkencana_2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_KepadatanPendudukGunungkencana_2.addFeatures(features_KepadatanPendudukGunungkencana_2);
var lyr_KepadatanPendudukGunungkencana_2 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_KepadatanPendudukGunungkencana_2, 
                style: style_KepadatanPendudukGunungkencana_2,
                popuplayertitle: 'Kepadatan Penduduk Gunungkencana',
                interactive: true,
    title: 'Kepadatan Penduduk Gunungkencana<br />\
    <img src="styles/legend/KepadatanPendudukGunungkencana_2_0.png" /> < 200<br />\
    <img src="styles/legend/KepadatanPendudukGunungkencana_2_1.png" /> 200 - 300<br />\
    <img src="styles/legend/KepadatanPendudukGunungkencana_2_2.png" /> > 300<br />' });

lyr_GoogleSatelliteHybrid_0.setVisible(false);lyr_GoogleSatellite_1.setVisible(true);lyr_KepadatanPendudukGunungkencana_2.setVisible(true);
var layersList = [lyr_GoogleSatelliteHybrid_0,lyr_GoogleSatellite_1,lyr_KepadatanPendudukGunungkencana_2];
lyr_KepadatanPendudukGunungkencana_2.set('fieldAliases', {'fid': 'fid', 'Desa': 'Desa', 'Luas (km2)': 'Luas (km2)', 'Jumlah': 'Jumlah', 'Laki-Laki': 'Laki-Laki', 'Perempuan': 'Perempuan', 'Kepadatan': 'Kepadatan', 'Sex Rasio': 'Sex Rasio', 'Sumber': 'Sumber', });
lyr_KepadatanPendudukGunungkencana_2.set('fieldImages', {'fid': 'TextEdit', 'Desa': 'TextEdit', 'Luas (km2)': 'TextEdit', 'Jumlah': 'Range', 'Laki-Laki': 'Range', 'Perempuan': 'Range', 'Kepadatan': 'TextEdit', 'Sex Rasio': 'TextEdit', 'Sumber': 'TextEdit', });
lyr_KepadatanPendudukGunungkencana_2.set('fieldLabels', {'fid': 'hidden field', 'Desa': 'inline label - visible with data', 'Luas (km2)': 'hidden field', 'Jumlah': 'inline label - visible with data', 'Laki-Laki': 'inline label - visible with data', 'Perempuan': 'inline label - visible with data', 'Kepadatan': 'inline label - visible with data', 'Sex Rasio': 'inline label - visible with data', 'Sumber': 'inline label - visible with data', });
lyr_KepadatanPendudukGunungkencana_2.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});