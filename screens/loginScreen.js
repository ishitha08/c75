import React from 'react';
import { Text, View, TouchableOpacity, Alert, TextInput, Image, StyleSheet, KeyboardAvoidingView, ToastAndroid, } from 'react-native';

export default class LoginScreen extends React.Component{
    constructor(){
        super();
        this.state = {
            emailId:'',
            password:'',
        }
    }
    Login = async(email,password)=>{
        if(email && password){
            try{
                const response = await firebase.auth().signInWithEmailAndPassword(email,password)
                if(response){
                    this.props.navigation.navigate('Transaction')
                }
            }
        catch(error){
            switch(error.code){
                case 'auth/user-not-Found':
                    Alert.alert("user does not exist")
                    break;

                    
                        case 'auth/invalid-email':
                            Alert.alert("invalid email or password")
            }
        }
    }
    else{
        Alert.alert('enter email and password')
    }
}
    
    render(){
        return(
            <View>
                <Text>Login Screen</Text>
                <KeyboardAvoidingView style = {{alignItems:'center', marginTop:20}}>
                    <View>
                        <Image 
                        source= {require("../assets/booklogo.jpg")}
                        style = {{width:200,height:200}}
                        >

                        </Image>
                        <Text style ={{textAlign:'center',fontSize:30}}>wily</Text>
                     </View>
                        <View>
                            <TextInput style = {styles.loginBox}
                            placeholder = "abc@example.com"
                            keyboardType = 'email-address'
                            onChangeText = {(text)=>{
                                this.setState({
                                    emailId:text
                                })
                            }}
                            >

                            </TextInput>
                            <TextInput style = {styles.loginBox}
                            secureTextEntry = {true}
                            placeholder = "enter password"
                            onChangeText = {(text)=>{
                                this.setState({
                                    password:text
                                })
                            }}
                            >

                            </TextInput>
                            
                        </View>
                        <View>
                            <TouchableOpacity 
                            style = {{height:30,width:90,borderWidth:1,marginTop:20,paddingTop:5,borderRadius:20}}
                            onPress = {()=>{this.Login(this.state.emailId,this.state.password)}}
                            >
                                    <Text style = {{textAlign:'center'}}>Login</Text>
                            </TouchableOpacity>
                        </View>
                </KeyboardAvoidingView>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    loginBox:{
       width:300,
       height:40,
       borderWidth:1.5,
       fontSize:20,
       margin:10,
       paddingLeft:10, 
    }
})