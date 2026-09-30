import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Notifications from 'expo-notifications';

const backendURI = Constants.expoConfig.extra.backendURI

export const hoursFromNow = (iso) => {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return NaN;

  return parseInt((Date.now() - ms) / 36e5);
}

export const changeDailyDash = async(id)=>{
    try {
        const jwt = await AsyncStorage.getItem("jwt")
        const raw = await fetch(`${backendURI}/dashboard/changeSpotlight`, {
            method: "PUT",
            headers:{
                "Authorization": jwt,
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                postID: id
            })
        })
        const response = await raw.json()
        return response.success
    } catch (error) {
        return false
    }
}

export const getDailyDash = async()=>{
    try {
        const jwt = await AsyncStorage.getItem("jwt")
        const raw = await fetch(`${backendURI}/dashboard/dailyPosts`, {
            method: "GET",
            headers:{
                "Authorization": jwt,
                "Content-Type": "application/json"
            }
        })
        const response = await raw.json()
        if (!response.success){
            throw Error("failed backend")
        }
        const main = response.myself.allPosts.find((each)=> each.postID == response.myself.spotLight)
        return {
            friends: response.friends,
            allMine: response.myself.allPosts,
            spotLight: main || response.myself.allPosts[0]
        }
    } catch (error) {
        console.log(error)
        return {}
    }
}

export const getFriends = async()=>{
    try {
        const jwt = await AsyncStorage.getItem("jwt")
        const freindRaw = await fetch(`${backendURI}/user/getFreinds`, {
            method: "GET",
            headers:{
                "Authorization": jwt,
                "Content-Type": "application/json"
            }
        })
        const freinds = await freindRaw.json()
        return freinds.freinds
    } catch (error) {
        return []
    }
}

export const deleteLocation = async()=>{
    try {
        const jwt = await AsyncStorage.getItem("jwt")
        const raw = await fetch(`${backendURI}/user/removeLocation`,{
            method: "DELETE",
            headers:{
                "Authorization": jwt,
                "Content-Type": "application/json"
            }
        })
        const response = await raw.json()
        return (response && response.success)
    } catch (error) {
        console.log(error)
        return false
    }
}

export const getProfileFunction = async()=>{
    try {
        const jwt = await AsyncStorage.getItem("jwt")
        if(!jwt){
            throw Error("No token")
        }
        const raw = await fetch(`${backendURI}/user/getProfile`,{
            method: "GET",
            headers:{
                "Authorization": jwt,
                "Content-Type": "application/json"
            }
        })
        const response = await raw.json()
        // console.log(response.profile)
        if(response && response.success){
            await AsyncStorage.setItem("profile", JSON.stringify(response.profile))
            console.log("profile")
            return response.profile
        }
        return null
    } catch (error) {
        console.log(error)
        return null
    }
}

export const validateToken = async()=>{
    try {
        const jwt = await AsyncStorage.getItem("jwt")
        const raw = await fetch(`${backendURI}/user/authToken`,{
            method: "PUT",
            headers: {
                "Authorization": jwt,
                "Content-Type": "application/json"
            }
        })
        const response = await raw.json()
        if(response && response.authorized && response.newToken){
            const newToken = response.newToken
            await AsyncStorage.setItem("jwt", newToken)
            return true
        }
        throw Error("Not validated")
    } catch (error) {
        console.log(error)
        return false
    }
}

export const updateToken = async()=>{
    try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return false;

        const pushToken = await AsyncStorage.getItem("pushToken")
        const jwt = await AsyncStorage.getItem("jwt")
        const {data: newToken} = await Notifications.getExpoPushTokenAsync()
        if(pushToken && pushToken == newToken){
            console.log("already token")
            return false
        }
        await AsyncStorage.setItem("pushToken", newToken)
        const raw = await fetch(`${backendURI}/profile/notificationUpdate`,{
            method: "PUT",
            headers:{
                "Authorization": jwt,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                newToken: newToken
            })
        })
        const response = await raw.json()
        console.log(response)
        return (response && response.success)
    } catch (error) {
        console.log(error)
        return false
    }
}