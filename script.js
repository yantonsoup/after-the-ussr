

ogr2ogr \
  -f GeoJSON \
  -where "ADM0_A3 IN ('ARM', 'AZE', 'BLR', 'EST', 'GEO', 'KAZ', 'KGZ', 'LVA', 'LTU', 'MDA', 'RUS', 'TJK', 'TKM', 'UKR', 'UZB')" \
  subunitsSovietReal.json \
  ne_10m_admin_0_map_subunits.shp

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