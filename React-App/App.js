import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, LayoutAnimation, ImageBackground } from 'react-native';
import axios from 'axios';

const WATER_RATE_URL = process.env.WATER_RATE_URL;
const TEMPERATURE_URL = process.env.TEMPERATURE_URL;
const TRIGGER_WATER_URL = process.env.TRIGGER_WATER_URL;

export default function App() {

  const [waterRate, setWaterRate] = useState(0);
  const [temperature, setTemperature] = useState(0); 
  const [showNotification, setShowNotification] = useState(false);

  const onColor = 'green';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const waterRateResponse = await axios.get(WATER_RATE_URL);
        const newWaterRate = waterRateResponse.data.data["water-rate"];
        setWaterRate(newWaterRate);

        const temperatureResponse = await axios.get(TEMPERATURE_URL);
        const newTemperature = temperatureResponse.data.data["temp"]; 
        setTemperature(newTemperature);

        // Vérifie si le niveau d'eau est inférieur ou égal à 30
        if (parseFloat(newWaterRate) <= 30) {
          setShowNotification(true);
        } else {
          setShowNotification(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const intervalId = setInterval(() => {
      fetchData();
    }, 3000);

    fetchData();

    return () => clearInterval(intervalId);
  }, []);

  const triggerWater = async () => {
    try {
      await axios.post(TRIGGER_WATER_URL, { status: 'ON' });
    } catch (error) {
      console.error('Error triggering water:', error);
    }
  };

  return (
    <ImageBackground
      source={require('./images/background.jpeg')}
      style={{ flex: 1, resizeMode: 'cover', justifyContent: 'center' }}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {showNotification ? (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, color: 'red' }}>Le niveau d'eau est bas!</Text>
            <Text style={{ fontSize: 18, color: 'red' }}>Appuyez sur le bouton ON.</Text>
          </View>
        ) : (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, color: 'green' }}>Tout est bon! Niveau d'eau normal.</Text>
          </View>
        )}
        <Text style={{ fontSize: 24, color: 'blue', marginBottom: 10 }}>Niveau d'eau</Text>
        <Text style={{ fontSize: 20, color: 'blue', marginBottom: 20 }}>{waterRate}</Text>

        <Text style={{ fontSize: 24, color: 'blue', marginBottom: 10 }}>Température</Text>
        <Text style={{ fontSize: 20, color: 'blue', marginBottom: 20 }}>{temperature} °C</Text>

        <TouchableOpacity
          style={{
            width: 150,
            height: 150,
            borderRadius: 120,
            borderWidth: 4,
            flexDirection: 'row',
            alignItems: 'center',
            overflow: 'hidden',
            borderColor: onColor,
            backgroundColor: waterRate >= 80 ? 'gray' : onColor,
          }}
          onPress={() => {
            LayoutAnimation.easeInEaseOut();
            triggerWater();
          }}
          disabled={waterRate >= 80}
        >
          <View
            style={{
              flex: 1,
              height: '90%',
              borderRadius: 80,
              backgroundColor: onColor,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ translateX: 0 }],
            }}
          >
            <Text style={{ fontSize: 35, color: 'white', fontWeight: '900' }}>ON</Text>
          </View>
        </TouchableOpacity>

      </View>
      <StatusBar style="auto" />
    </ImageBackground>
  );
}
