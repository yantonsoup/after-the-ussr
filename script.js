

ogr2ogr \
  -f GeoJSON \
  -where "ADM0_A3 IN (  'ARM', 'AZE', 'BLR', 'EST', 'GEO', 'KAZ', 'KGZ', 'LVA', 'LTU', 'MDA', 'RUS', 'TJK', 'TKM', 'UKR', 'UZB')" \
  soviet.json \
  ne_50m_admin_0_map_subunits.shp

  ogr2ogr \
  -f GeoJSON \
  -where "ISO_A2 = 'GB' AND SCALERANK < 8" \
  placesSovietReal.json \
  ne_10m_populated_places.shp

  topojson \
  -o sovietTopoReal.json \
  --id-property SU_A3 \
  --properties name=NAME \
  -- \
  placesSovietReal.json \
  subunitsSovietReal.json 


  'ARM', 'AZE', 'BLR', 'EST', 'GEO', 'KAZ', 'KGZ', 'LVA', 'LTU', 'MDA', 'RUS', 'TJK', 'TKM', 'UKR', 'UZB'

  ogr2ogr -f GeoJSON -t_srs EPSG:4326 -lco COORDINATE_PRECISION=6 
ne_110m_admin_0_countries.geojson 
/vsicurl/https://github.com/nvkelso/natural-earth-vector/raw/master/110m_cultural/ne_110m_admin_0_countries.shp


ogr2ogr \
  -f GeoJSON \
  world.json \
  ne_50m_admin_0_countries/ne_50m_admin_0_countries.shp



  // create map
  ogr2ogr \
  -f GeoJSON \
  world.json \
  ne_50m_admin_0_countries.shp

  // convert to TOPOjson
  topojson --id-property iso_a3 -p name -o world-topo.json world.json
