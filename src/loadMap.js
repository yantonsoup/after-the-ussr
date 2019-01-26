
export default function loadMap() {
  return new Promise((resolve, reject) => {
    d3.json("https://yantonsoup.github.io/after-the-ussr/public/json/110topoworld.json", function(json) {
      console.warn("loaded 110topoworld.json:", json);
      resolve(json);
    });
  });
}
