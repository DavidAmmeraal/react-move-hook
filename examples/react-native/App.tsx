import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function App() {
  const ref = useRef<TouchableOpacity>(null);
  const [state, setState] = useState({
    moving: false,
    delta: undefined,
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity ref={ref}>
        <View style={styles.rect}></View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 500,
    height: 500,
    backgroundColor: "blue",
  },
  rect: {
    top: 50,
    left: 50,
    width: 50,
    height: 50,
    backgroundColor: "red",
  },
});
