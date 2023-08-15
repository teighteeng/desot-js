// 🌈
function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";

  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}

// ===== READY GO ----- //
async function start() {
  const GENERATED_COLORS = [];

  let map = null;

  let regions = [];
  let provinces = [];
  let districts = [];
  let subDistricts = {};

  let regionLayer = null;
  let provinceLayer = null;
  let districtLayer = null;
  let subDistrictLayer = null;

  let lastZoom = 0;
  let previousLevel = -1;
  let level = 0;

  let nowRegion = "";
  let nowProvince = "";
  let nowDistrict = "";
  let nowSubDistrict = "";

  let isProcess = true

  // 🙏
  async function _getData(url) {
    const response = await fetch(url);
    return response.json();
  }

  // 🌈
  function _getColor() {
    var color;

    do {
      color = getRandomColor();
    } while (GENERATED_COLORS.includes(color));

    GENERATED_COLORS.push(color);

    return color;
  }

  // 🙏
  async function fetchData() {
    try {
      regions = await _getData("/data/regions.geojson");
      provinces = await _getData("/data/provinces.geojson");
      districts = await _getData("/data/districts.geojson");
      subDistricts = await _getData("/data/subdistricts.geojson");
    } catch (err) {
      console.error(err);
    }
  }

  // 🗺️
  async function initMap(element) {
    map = await L.map(element, {
      // center: [13.75, 100.516667],
      // zoom: 5,
      minZoom: 5,
      // maxZoom: 5,
      // scrollWheelZoom: false,
      // dragging: false,
      crs: L.CRS.Simple,
      zoomControl: false,
      attributionControl: false,
    });

    map.on("zoom", function () {
      setTimeout(() => {
        if (isProcess) {
          const currentZoom = map.getZoom();
  
          if (((previousLevel !== level) && currentZoom >= 5) && currentZoom <= lastZoom) {
            // destroyLayer();
    
            previousLevel = level
    
            switch (level) {
              case 3:
                renderProvince();
                break;
              case 4:
                renderDistrict();
                break;
              case 5:
                renderSubDistrict();
                break;
              default:
                renderRegion();
                break;
            }
          }
        } else {
          isProcess = false
        }
      }, 200);
    });
  }

  // ☠️
  function destroyLayer() {
    console.log('object');
    isProcess = true
  
    if (regionLayer) map.removeLayer(regionLayer);
    if (provinceLayer) map.removeLayer(provinceLayer);
    if (districtLayer) map.removeLayer(districtLayer);
    if (subDistrictLayer) map.removeLayer(subDistrictLayer);

    regionLayer = null;
    provinceLayer = null;
    districtLayer = null;
    subDistrictLayer = null;

    isProcess = false
  }

  // 🖥️
  function renderRegion() {
    isProcess = true

    function getFillColor(regionName) {
      switch (regionName.toLowerCase()) {
        case "central":
          return "#127369";
        case "east":
          return "#10403B";
        case "northern":
          return "#8AA6A3";
        case "northeast":
          return "#4C5958";
        case "uppernorth":
          return "#BFBFBF";
        case "lowwernorth":
          return "#042940";
        case "south":
          return "#9FC131";
        case "north":
          return "#DBF227";
        case "west":
          return "#DBF227";
        default:
          return "#D6D58E";
      }
    }

    const newRegions = regions;
    console.log('object');
    newRegions.features = newRegions.features.map((region) => {
      return {
        ...region,
        // fillColor: getFillColor(region.properties.reg_nesdb),
      };
    });

    console.log(newRegions);

    regionLayer = L.geoJSON(newRegions, {
      style: () => {
        return {
          fillColor: _getColor(), //
          fillOpacity: 1,
          color: "black",
          weight: 0.5,
        };
      },
      onEachFeature: function (feature, layer) {
        layer.on("click", function () {
          nowRegion = feature.properties.reg_nesdb;
          renderProvince();
        });
      },
    }).addTo(map);

    regionLayer.setStyle({ fillOpacity: 1 });
    map.fitBounds(regionLayer.getBounds());
    map.setMaxBounds(regionLayer.getBounds());

    level = 1;
    lastZoom = map.getZoom();

    isProcess = false
  }

  // 🖥️
  function renderProvince() {
    isProcess = true

    regionLayer.setStyle({ fillOpacity: 0.1 });

    const newProvinces = provinces;
    newProvinces.features = provinces.features.filter(
      (feature) =>
        feature.properties.reg_nesdb.toLowerCase() === nowRegion.toLowerCase()
    );

    console.log(provinces);

    provinceLayer = L.geoJSON(newProvinces, {
      style: () => {
        return {
          fillColor: _getColor(), //
          fillOpacity: 1,
          color: "black",
          weight: 0.5,
        };
      },
      onEachFeature: function (feature, layer) {
        layer.on("click", function () {
          nowProvince = feature.properties.pro_en;
          renderDistrict();
        });
      },
    }).addTo(map);

    provinceLayer.setStyle({ fillOpacity: 1 });
    map.fitBounds(provinceLayer.getBounds());

    setTimeout(() => {
      map.setMaxBounds(provinceLayer.getBounds());
      level = 2;
      lastZoom = map.getZoom();
    }, 200);

    isProcess = false
  }

  // 🖥️
  function renderDistrict() {
    isProcess = true

    provinceLayer.setStyle({ fillOpacity: 0.1 });

    const newDistricts = districts;
    newDistricts.features = districts.features.filter(
      (feature) =>
        feature.properties.pro_en.toLowerCase() === nowProvince.toLowerCase()
    );

    districtLayer = L.geoJSON(newDistricts, {
      style: () => {
        return {
          fillColor: _getColor(), //
          fillOpacity: 1,
          color: "black",
          weight: 0.5,
        };
      },
      onEachFeature: function (feature, layer) {
        layer.on("click", function () {
          nowDistrict = feature.properties.amp_en;
          renderSubDistrict();
        });
      },
    }).addTo(map);

    districtLayer.setStyle({ fillOpacity: 1 });
    map.fitBounds(districtLayer.getBounds());

    setTimeout(() => {
      map.setMaxBounds(districtLayer.getBounds());
      level = 3;
      lastZoom = map.getZoom();
    }, 200);

    isProcess = false
  }

  // 🖥️
  function renderSubDistrict() {
    isProcess = true

    districtLayer.setStyle({ fillOpacity: 0.1 });

    const newSubDistricts = subDistricts;
    newSubDistricts.features = subDistricts.features.filter(
      (feature) =>
        feature.properties.amp_en.toLowerCase() === nowDistrict.toLowerCase()
    );

    subDistrictLayer = L.geoJSON(newSubDistricts, {
      style: () => {
        return {
          fillColor: _getColor(), //
          fillOpacity: 1,
          color: "black",
          weight: 0.5,
        };
      },
      onEachFeature: function (feature, layer) {
        layer.on("click", function () {
          console.log(feature);
        });
      },
    }).addTo(map);

    subDistrictLayer.setStyle({ fillOpacity: 1 });
    map.fitBounds(subDistrictLayer.getBounds());

    setTimeout(() => {
      map.setMaxBounds(subDistrictLayer.getBounds());
      level = 4;
      lastZoom = map.getZoom();
    }, 200);

    isProcess = false
  }

  // Initial.
  const mapElement = document.querySelector("[dada-desot]");

  await fetchData();
  await initMap(mapElement);

  renderRegion();
}

start();
