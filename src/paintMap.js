import { sovietCountryIsoCodes, colors, sovietLabelShift } from "./constants";
import Map from './map.js'

const rotate = -20; // so that [-60, 0] becomes initial center of projection
const maxlat = 83;

const mercatorBounds = function(projection) {
  const yaw = projection.rotate()[0];
  const xymax = projection([-yaw + 180 - 1e-6, -maxlat]);
  const xymin = projection([-yaw - 180 + 1e-6, maxlat]);

  return [xymin, xymax];
};

export default function paintMap(countries) {
  const map = new Map({
    data: countries,
    element: '.scroll__graphic'
  })

    return { 
      path: map.path,
      map: map.mapCanvas,
      projection: map.projection
   };
}


