import { Tabs, Stack } from 'expo-router';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function StackLayout() {

  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(colors);

  return (
    <>
    <StatusBar
      translucent={true}
      backgroundColor="transparent"
      barStyle={colorScheme === "light"? "light-content": "dark-content"} 
    />

    <Stack
        screenOptions={{
            headerShown: false
        }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Home'
        }}
      />
      
    </Stack>
    </>
  );
}

function createStyles(colors) {

  return StyleSheet.create({
    
  });
}
