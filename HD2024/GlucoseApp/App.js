import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HistoryScreen from "./screens/HistoryScreen";
import ChatbotScreen from "./screens/ChatbotScreen";
import {
  Entypo,
  EvilIcons,
  Feather,
  AntDesign,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons
} from "@expo/vector-icons";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
    <Tab.Navigator>
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View>
              <MaterialCommunityIcons name="history" size={30} color="black" />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View>
              <AntDesign name="linechart" size={30} color="black" />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View>
              <Entypo name="chat" size={30} color="black" />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
    </NavigationContainer>
  );
}
/*
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#333333",
          },
        }}
      >
        <Stack.Screen
          options={{ headerShown: false }}
          name="Overall"
          component={Main}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Overall"
          component={Main}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Overall"
          component={Main}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Overall"
          component={Main}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
