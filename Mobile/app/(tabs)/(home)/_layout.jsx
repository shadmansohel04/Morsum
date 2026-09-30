import { Stack } from 'expo-router';
import { StatusBar, useColorScheme } from 'react-native';

export default function StackLayout() {

  const colorScheme = useColorScheme();

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
        name='(post)/individualPost'
        // options={{gestureEnabled: false}}
      />

      <Stack.Screen
        name='index'
        options={{
          gestureEnabled: false,
          animationTypeForReplace: "pop"
        }}
      />

      <Stack.Screen
        name='(post)/commentsPage'
        // options={{gestureEnabled: false}}
      />
      
    </Stack>
    </>
  );
}