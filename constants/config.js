import { Dimensions } from "react-native";

export const { width, height } = Dimensions.get("window");

export const INITIAL_REGION = {
  latitude: 39.0,
  longitude: 35.0,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

export const HIGH_MAGNITUDE_THRESHOLD = 4;
export const BUBBLE_THRESHOLD = 3;

export const DATA_URL =
  "https://raw.githubusercontent.com/bedirhan327/deprem-veri-collector/main/public/data/deprem_data.json";

