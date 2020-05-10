import React from 'react';
import { Text, View, TouchableOpacity, Alert, TextInput, Image, StyleSheet, KeyboardAvoidingView, ToastAndroid, } from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config';
export default class TransactionScreen extends React.Component {
  constructor(){
    super();
    this.state = {
      hasCameraPermissions:null,
      scanned:false,
      scannedData:'',
      buttonState:'normal',
    }
  }
  getCameraPermissions = async()=>{
    const {status}=await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermissions:status==="granted",
      buttonState: id,
        scanned: false
    });
  }
  handleBarCodeScanned = async({type, data})=>{
    const {buttonState} = this.state

    if(buttonState==="BookId"){
      this.setState({
        scanned: true,
        scannedBookId: data,
        buttonState: 'normal'
      });
    }
    else if(buttonState==="StudentId"){
      this.setState({
        scanned: true,
        scannedStudentId: data,
        buttonState: 'normal'
      });
    }
    
  }
      handleTransaction=async()=>{
        var transactionType = await this.checkBookEligibility();
        if(!transactionType){
          Alert.alert("the book does not exist in the database")
          this.setState({
            
              scannedStudentId:'',
              scannedBookId:'',
            
          })
        }
        else if(transactionType==="issue"){
          var isStudentEligible = await this.checkStudentEligibilityForBookIssue()
          if(isStudentEligible){
            this.intiateBookIssue()
            Alert.alert("book issued to the student");
          }
        }
        else{
          var isStudentEligible = await this.checkStudentEligibilityForBookReturn()
          if(isStudentEligible){
            this.intiateBookReturn()
            Alert.alert("book returned to the library ");
          }
        }
        var transactionMessage
        db.collection("books").doc(this.state.scannedBookId).get().then((doc)=>{
          console.log(doc.data())
          var book = doc.data()
          if(book.bookAvailability){
            this.intiateBookIssue();
            transactionMessage = "bookIssued"
           // Alert.alert(transactionMessage)
           ToastAndroid.show(transactionMessage,ToastAndroid.SHORT);
          }
          else{
            this.intiateBookReturn();
            transactionMessage="bookReturn"
           // Alert.alert(transactionMessage)
           ToastAndroid.show(transactionMessage,ToastAndroid.SHORT);
          }
        })
        this.setState({
          transactionMessage:transactionMessage
        })
  }
      intiateBookIssue = async()=>{
        db.collection("transactions").add({
          'studentId':this.state.scannedStudentId,
          'bookId':this.state.scannedBookId,
          'date':firebase.firestore.Timestamp.now().toDate(),
          'transactionType':"Issue"
        })
        db.collection("books").doc(this.state.scannedBookId).update({
          'bookAvailability':false
        })
        db.collection("student").doc(this.state.scannedStudentId).update({
         'numberOfBookIssued':firebase.firestore.FieldValue.increment(1)
        })
        Alert.alert("books issued")
        this.setState({
          scannedBookId:'',
          scannedStudentId:'',
        })
  }
  intiateBookReturn = async()=>{
    db.collection("transactions").add({
      'studentId':this.state.scannedStudentId,
      'bookId':this.state.scannedBookId,
      'date':firebase.firestore.Timestamp.now().toDate(),
      'transactionType':"Return"
    })
    db.collection("books").doc(this.state.scannedBookId).update({
      'bookAvailability':true
    })
    db.collection("student").doc(this.state.scannedStudentId).update({
     'numberOfBookIssued':firebase.firestore.FieldValue.increment(-1)
    })
    Alert.alert("books returned")
    this.setState({
      scannedBookId:'',
      scannedStudentId:'',
    })
}
    checkBookEligibility=async()=>{
      const bookRef = await db.collection("books").where("bookId","==",this.state.scannedBookId).get()
      var transactionType=""
      if(bookRef.docs.length==0){
        transactionType=false;

      }
           else{
           bookRef.docs.map((doc)=>{
           var book = doc.data()
          if(book.bookAvailability){
            transactionType="issue"
          }
          else{
            transactionType="return"
          }
        })
      }
      return transactionType
    }
      checkStudentEligibilityForBookIssue=async()=>{
        const studentRef = await db.collection("students").where("studentId","==",this.state.scannedStudentId).get()
        var isStudentEligible = ""
        if(studentRef.docs.length==0){
          this.setState({
            scannedBookId:'',
            scannedStudentId:'',
          })
          isStudentEligible=false
          Alert.alert("student id does not exist in the database")
        }
        else{
          studentRef.docs.map((doc)=>{
            var student = doc.data();
            if(student.numberOfBookIssued<2){
              isStudentEligible=true
            }
            else{
              isStudentEligible=false;
              Alert.alert("student has already issued two books")
              this.setState({
                scannedBookId:'',
                scannedStudentId:'',
              })
            }
          })
        }
        return isStudentEligible
      }
      checkStudentEligibilityForBookReturn=async()=>{
        const transactionRef = await db.collection("transactions").where("bookId","==",this.state.scannedBookId).limit(1).get()
        var isStudentEligible = ""
        transactionRef.docs.map((doc)=>{
          var lastBookTransaction = doc.data();
          if(lastBookTransaction.studentId===this.state.scannedStudentId){
            isStudentEligible=true
          }

           else{
              isStudentEligible=false;
              Alert.alert("the book was not issued by the student")
              this.setState({
                scannedBookId:'',
                scannedStudentId:'',
              })
            }
          })
        
        return isStudentEligible
      }

      render() {
      const hasCameraPermissions = this.state.cameraPermissions;
      const scanned=this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style = {styles.container} behavior="padding" enabled>
            <View style={styles.container}>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText ={text=>this.setState({scannedBookId:text})}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText ={text=>this.setState({scannedBookId:text})}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity 
            style= {styles.submitButton}
            onPress={async()=>{var transactionMessage=this.handleTransaction();
            this.setState({
              scannedBookId:'',
              scannedStudentId:'',
            })
            }} >
            <Text style = {styles.submitButtonText}>submit</Text>
            </TouchableOpacity>
           </View>
              </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
      backgroundColor:'blue',
      width:100,
      height:50,

    },
    submitButtonText:{
      padding:10,
      textAlign:'center',
      fontSize:20,
      fontWeight:"bold",
      color:'white',

    }
  });