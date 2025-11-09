import * as Location from "expo-location";

// 📍 Konum izni iste + kullanıcı konumu döndür
export async function getUserLocation() {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.log("Konum izni reddedildi");
    return null;
  }

  const location = await Location.getCurrentPositionAsync({});
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}
