export default function loadMap() {
  return new Promise((resolve, reject) => {
    d3.json("https://aftertheussr.com/json/110topoworld.json", function(json) {
      console.warn("loaded 110topoworld.json:", json);
      resolve(json);
    });
  });
}
