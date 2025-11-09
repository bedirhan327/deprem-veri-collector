import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// 🔔 Bildirim ayarları
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 🔹 Bildirim izni al + token oluştur
export async function registerForPushNotificationsAsync() {
  // Development modunda simülatör için mock token üret
  const isDevelopment = __DEV__;
  
  if (!Device.isDevice) {
    if (isDevelopment) {
      // Simülatör için mock token (test amaçlı)
      // "MOCK_" prefix'i ile başlayan token'lar API'de ayırt edilebilir
      const mockToken = `MOCK_ExponentPushToken[${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}]`;
      console.log("⚠️ Simülatör modu - Mock token üretildi:", mockToken);
      console.log("⚠️ Bu token gerçek bildirim göndermez, sadece test amaçlıdır");
      return mockToken;
    }
    console.log("Fiziksel cihaz gerekli (simülatör desteklemez)");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Bildirim izni verilmedi");
    return null;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("✅ Expo push token alındı:", token);
    return token;
  } catch (error) {
    console.error("❌ Token alma hatası:", error);
    return null;
  }
}

// 🔹 Yerel bildirim gönder
export async function sendLocalNotification(title, body) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { 
        title, 
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Hemen gönder
    });
    console.log("✅ Yerel bildirim gönderildi:", title);
  } catch (error) {
    console.error("❌ Yerel bildirim gönderme hatası:", error);
  }
}
