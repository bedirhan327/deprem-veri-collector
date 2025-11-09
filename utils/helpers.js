import * as d3Scale from "d3-scale";

// 🔹 ML değerini parse et
export const parseML = (v) => {
  if (v === null || v === undefined) return NaN;
  const s = v.toString().replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? NaN : n;
};

// 🔹 Haversine formülü (km cinsinden mesafe)
export const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 🔹 Marker boyutunu hesapla
export const getMarkerSize = (ML, zoom) => {
  const magnitude = Math.max(0, ML || 0);
  const baseSize = 10 + 5 * magnitude;
  const zoomDampen = Math.pow(Math.max(0.5, Math.min(zoom, 20)), -0.12);
  return Math.max(12, Math.min(baseSize * zoomDampen, 42));
};

// 🔹 Renk skalası
export const colorScale = d3Scale
  .scaleThreshold()
  .domain([2, 4, 6])
  .range(["#91cf60", "#fee08b", "#fc8d59", "#d73027"]);

