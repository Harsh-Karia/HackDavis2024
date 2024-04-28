import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import React, { useEffect } from "react";
import { VictoryBar, VictoryChart, VictoryTheme } from "victory-native";
import * as GoogleGenerativeAI from "@google/generative-ai";
import { useState } from "react";

const ChatbotScreen = () => {
  const API_KEY = "AIzaSyCjjpOHwpT6r09VC-iQzIr4nTyRjdYGskI";

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const StartChat = async () => {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = "Hello.";

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      console.log(text);
      setMessages([
        {
          text,
          user: false,
        },
      ]);
    };

    StartChat();
  }, []);

  const sendMessage = async () => {
    setLoading(true);
    const userMessage = { text: userInput, user: true };
    setMessages([...messages, userMessage]);

    const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = userMessage.text;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    setMessages([...messages, { text, user: false }]);
    setLoading(false);
    setUserInput("");
  };

  const renderMessage = ({ item }) => (
    <View style={styles.messageContainer}>
      <Text style={[styles.messageText, item.user && styles.userMessage]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <Text>Hello!!</Text> */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.text}
        inverted
      />
      <KeyboardAvoidingView style={styles.inputContainer}>
        <TextInput
          placeholder="Type a message"
          onChangeText={setUserInput}
          value={userInput}
          onSubmitEditing={sendMessage}
          style={styles.input}
          placeholderTextColor="black"
        />
        {loading && <ActivityIndicator size="small" color="black" />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatbotScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#474F7A" },
  messageContainer: { padding: 10, marginVertical: 5 },
  messageText: { fontSize: 16 },
  inputContainer: { flexDirection: "row", alignItems: "center", padding: 10 },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
});
