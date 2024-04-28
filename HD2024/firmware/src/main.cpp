#include <iostream>
#include <string>

#include <Arduino.h>
#include <Firebase_ESP_Client.h>
#include <NTPClient.h>
#include <WiFi.h>
#include <WiFiUdp.h>

//Provide the token generation process info.
#include "addons/TokenHelper.h"
//Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// Insert your network credentials
#define WIFI_SSID "WIFI_SSID_HERE"
#define WIFI_PASSWORD "WIFI_PASSWORD_HERE"

// Insert Firebase project API Key
#define API_KEY "FIREBASE_API_KEY_HERE"

// Insert RTDB URLefine the RTDB URL */
#define DATABASE_URL "FIREBASE_DATA_URL_HERE" 

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP);

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
bool signupOK = false;

int pdVoltsOn;
int pdVoltsOff;
String timestamp;
String path;

int IR_LED_PIN = 32;
int PHOTODIODE_PIN = 34;
int RED_LED = 25;
int GREEN_LED = 26;
int BLUE_LED = 27;

int GREEN = 0;
int YELLOW = 1;
int RED = 2;

int getOnPhotodiode(){
  digitalWrite(IR_LED_PIN, HIGH);
  //Serial.printf("IR LED ON\n");
  delay(150);
  pdVoltsOn = analogReadMilliVolts(PHOTODIODE_PIN);
  
  return pdVoltsOn;
}

int getOffPhotodiode(){
  digitalWrite(IR_LED_PIN, LOW);
  //Serial.printf("IR LED OFF\n");
  delay(150);
  pdVoltsOff = analogReadMilliVolts(PHOTODIODE_PIN);

  return pdVoltsOff;
}

bool fingerDetected(){
  pdVoltsOn = getOnPhotodiode();
  pdVoltsOff = getOffPhotodiode();
  if (pdVoltsOn < 950 && pdVoltsOff < 400){
    return true;
  }
  return false;
}

void updateFirebase(int pdVoltsOn, int pdVoltsOff){
  timeClient.update();
  unsigned long epochTime = timeClient.getEpochTime();
  char timestr[64];
  ltoa(epochTime, timestr, 10);
  String timestring = String(timestr);

  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0)){
    sendDataPrevMillis = millis();
  
    // Write an Float number on the database path test/float
    if (Firebase.RTDB.setInt(&fbdo, "epochs/" + timestring + "/on", pdVoltsOn)){
      Serial.println("PASSED");
      Serial.println("PATH: " + fbdo.dataPath());
      Serial.println("TYPE: " + fbdo.dataType());
    }
    else {
      Serial.println("FAILED");
      Serial.println("REASON: " + fbdo.errorReason());
    }

    // Write an Float number on the database path test/float
    if (Firebase.RTDB.setInt(&fbdo, "epochs/" + timestring + "/off", pdVoltsOff)){
      Serial.println("PASSED");
      Serial.println("PATH: " + fbdo.dataPath());
      Serial.println("TYPE: " + fbdo.dataType());
    }
    else {
      Serial.println("FAILED");
      Serial.println("REASON: " + fbdo.errorReason());
    }
  }
}

void setLED(int color){
  if (color == RED){
    digitalWrite(RED_LED, HIGH);
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(BLUE_LED, LOW);
  }
  else if (color == GREEN){
    digitalWrite(RED_LED, LOW);
    digitalWrite(GREEN_LED, HIGH);
    digitalWrite(BLUE_LED, LOW); 
  }
  else if (color == YELLOW){
    digitalWrite(RED_LED, HIGH);
    digitalWrite(GREEN_LED, HIGH);
    digitalWrite(BLUE_LED, LOW); 
  }

}

void setup() {
  // initialize serial communication at 115200 bits per second:
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  /* Assign the api key (required) */
  config.api_key = API_KEY;

  /* Assign the RTDB URL (required) */
  config.database_url = DATABASE_URL;

  /* Sign up */
  if (Firebase.signUp(&config, &auth, "", "")){
    Serial.println("Anonymous authentication successful.");
    signupOK = true;
  }
  else{
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }
  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  Serial.println("Connected to Firebase Realtime Database");

  //set the resolution to 12 bits (0-4096)
  analogReadResolution(12);
  pinMode(IR_LED_PIN, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(BLUE_LED, OUTPUT);

  timeClient.begin();
  setLED(GREEN);
}

void loop() {
  
  setLED(GREEN);
  if (fingerDetected()){
    delay(800);
    setLED(YELLOW);
    Serial.println("----------------------");
    Serial.println("Finger detected.");
    int onAverage = 0;
    int offAverage = 0;
    for (int i = 0; i < 10; i++){
      onAverage += getOnPhotodiode();
      offAverage += getOffPhotodiode();
    }
    onAverage /= 10;
    offAverage /= 10;

    double glucose1 = -0.261*onAverage + 318;
    double glucose2 = -0.608*onAverage + 590;
    Serial.printf("Glucose 1 = %f\n",glucose1);
    Serial.printf("Glucose 2 = %f\n",glucose2);
    Serial.printf("Average ON = %d\n",onAverage);
    Serial.printf("Average OFF = %d\n",offAverage);
    updateFirebase(onAverage, offAverage);
    Serial.println("Sent to firebase.");
    Serial.println("----------------------");
    setLED(RED);
    delay(1000);
  }
  else {
    setLED(GREEN);
    Serial.println("Finger not detected");
  }
  
}

