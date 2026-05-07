import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RNBootSplash from "react-native-bootsplash";

function App() {

    useEffect(() => {
    RNBootSplash.hide({ fade: true });
  }, []); 

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hi there 👋</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
});

export default App;