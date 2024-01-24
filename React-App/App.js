import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, LayoutAnimation, ImageBackground } from 'react-native';
import axios from 'axios';

export default function App() {
  const [isOn, setIsOn] = useState(false);
  const [waterRate, setWaterRate] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  const onColor = 'green';
  const offColor = 'red';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://10.57.33.57:8080/water-rate/last');
        const newWaterRate = response.data.data["water-rate"];
        setWaterRate(newWaterRate);

        // Check if water rate is <= 30
        if (parseFloat(newWaterRate) <= 30) {
          setShowNotification(true);
        } else {
          setShowNotification(false);
        }
      } catch (error) {
        console.error('Error fetching water rate:', error);
      }
    };

    const intervalId = setInterval(() => {
      fetchData();
    }, 3000);

    // Fetch data immediately when component mounts
    fetchData();

    return () => clearInterval(intervalId);
  }, []);

  const triggerWater = async () => {
    try {
      const statusToSend = !isOn; // Utilise la valeur actuelle de isOn pour déterminer le statut à envoyer
      const status = statusToSend ? 'ON' : 'OFF';
      await axios.post('http://10.57.33.57:8080/trigger-water', { status });
      setIsOn(statusToSend);
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
        <TouchableOpacity
          style={{
            width: 220,
            height: 80,
            borderRadius: 90,
            borderWidth: 4,
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 150,
            overflow: 'hidden',
            borderColor: isOn ? onColor : offColor
          }}
          onPress={() => {
            LayoutAnimation.easeInEaseOut();
            triggerWater();
          }}
        >
          <View
            style={{
              flex: 1,
              height: '90%',
              borderRadius: 80,
              backgroundColor: isOn ? onColor : offColor,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ translateX: isOn ? 145 : 5 }],
            }}
          >
            <Text style={{ fontSize: 22, color: 'white', fontWeight: '500' }}>
              {isOn ? 'ON' : 'OFF'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </ImageBackground>
  );
}
