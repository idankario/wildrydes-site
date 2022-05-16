/*global WildRydes _config*/

var WildRydes = window.WildRydes || {};
WildRydes.map = WildRydes.map || {};

(function esriMapScopeWrapper($) {
  require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/symbols/TextSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/geometry/support/webMercatorUtils",

    "dojo/domReady!",
  ], function requireCallback(
    esriConfig,
    Map,
    MapView,
    Graphic,
    Point,
    TextSymbol,
    PictureMarkerSymbol,
    webMercatorUtils
  ) {
    esriConfig.apiKey =
      "AAPKc2e23e1737344001b3ac89d4921c46d7zQSvJVTuj0KtYnQY8r7NTj3SRp3k1bZlAR3Xfgkbwbyn89X-xme7hPI-efiVAYka";

    var wrMap = WildRydes.map;

    var map = new Map({
      basemap: "arcgis-topographic",
      ground: "world-elevation",
    });

    var view = new MapView({
      center: [34.80359, 32.09006],
      container: "map",
      map: map,
      zoom: 17,
    });

    var pinSymbol = new TextSymbol({
      color: "#f50856",
      text: "\ue61d",
      font: {
        size: 20,
        family: "CalciteWebCoreIcons",
      },
    });

    var unicornSymbol = new PictureMarkerSymbol({
      url: "/images/unicorn-icon.png",
      width: "25px",
      height: "25px",
    });

    var pinGraphic;
    var unicornGraphic;

    function updateCenter(newValue) {
      wrMap.center = {
        latitude: newValue.latitude,
        longitude: newValue.longitude,
      };
    }

    function updateExtent(newValue) {
      var min = webMercatorUtils.xyToLngLat(newValue.xmin, newValue.ymin);
      var max = webMercatorUtils.xyToLngLat(newValue.xmax, newValue.ymax);
      wrMap.extent = {
        minLng: min[0],
        minLat: min[1],
        maxLng: max[0],
        maxLat: max[1],
      };
    }

    view.watch("extent", updateExtent);
    view.watch("center", updateCenter);

    view.on("click", function handleViewClick(event) {
      wrMap.selectedPoint = event.mapPoint;
      view.graphics.remove(pinGraphic);
      pinGraphic = new Graphic({
        symbol: pinSymbol,
        geometry: wrMap.selectedPoint,
      });
      view.graphics.add(pinGraphic);
      $(wrMap).trigger("pickupChange");
    });

    wrMap.animate = function animate(origin, dest, callback) {
      var startTime;
      var step = function animateFrame(timestamp) {
        var progress;
        var progressPct;
        var point;
        var deltaLat;
        var deltaLon;
        if (!startTime) startTime = timestamp;
        progress = timestamp - startTime;
        progressPct = Math.min(progress / 2000, 1);
        deltaLat = (dest.latitude - origin.latitude) * progressPct;
        deltaLon = (dest.longitude - origin.longitude) * progressPct;
        point = new Point({
          longitude: origin.longitude + deltaLon,
          latitude: origin.latitude + deltaLat,
        });
        view.graphics.remove(unicornGraphic);
        unicornGraphic = new Graphic({
          geometry: point,
          symbol: unicornSymbol,
        });
        view.graphics.add(unicornGraphic);
        if (progressPct < 1) {
          requestAnimationFrame(step);
        } else {
          callback();
        }
      };
      requestAnimationFrame(step);
    };

    wrMap.unsetLocation = function unsetLocation() {
      view.graphics.remove(pinGraphic);
    };
  });
})(jQuery);
