import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UploadScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [zoom, setZoom] = useState(0);
  const [facing, setFacing] = useState("back");
  const savedZoom = useRef(0);
  const isFocused = useIsFocused()
  const router = useRouter()

  if (!isFocused){
    return <View/>
  }

  const pinchGesture = Gesture.Pinch()
    .runOnJS(true)
    .onStart(() => {
        savedZoom.current = zoom;
    })
    .onChange((e) => {
        let newZoom = savedZoom.current + (e.scale - 1) * 0.5;
        newZoom = Math.min(Math.max(newZoom, 0), 1);
        setZoom(newZoom);
    });

  const gestures = Gesture.Simultaneous(pinchGesture);

  const confirmPicture = async ()=>{
    try{
      await AsyncStorage.setItem("currentImage", photo)
      router.push("confirmPost")
    }
    catch(error){
      console.log("whoops", error)
    }
  }
  
  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const capturedPhoto = await cameraRef.current.takePictureAsync({
          quality: 1,
        });
        setPhoto(capturedPhoto.uri);
      } catch (error) {
        console.error("Error taking photo:", error);
      }
    }
  };

  const resetCamera = () => {
    setPhoto(null);
    setZoom(0);
  };

    if (!permission) return <View style={styles.container} />;
    
    if (!permission.granted) {
        return (
        <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>We need your permission to use the camera.</Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
        </View>
        );
    }

  if (photo) {
        return (
        <View style={styles.container}>
            <Image source={{ uri: photo }} style={styles.fullScreenImage} />
            <View style={styles.overlay}>
              <View style={styles.header}>
                  <TouchableOpacity onPress={resetCamera} style={styles.actionButton}>
                    <Text style={styles.actionText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={confirmPicture} style={styles.actionButton}>
                    <Text style={styles.actionTextBlue}>Use Photo</Text>
                  </TouchableOpacity>
              </View>
            </View>
        </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <GestureDetector gesture={gestures}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            zoom={zoom}
            animateShutter={true}
          />
        </GestureDetector>

        <View style={styles.controlsContainer} pointerEvents="box-none">

            <TouchableOpacity style={styles.shutterOuter} onPress={takePhoto}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>

        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  fullScreenImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  actionButton: {
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
  },
  actionText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  actionTextBlue: {
    color: "#0A84FF", 
    fontSize: 18,
    fontWeight: "bold",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingBottom: 40,
    justifyContent: "center",
    alignItems: "center"
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "white",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: {
    color: "white",
    fontSize: 16,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#0A84FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});