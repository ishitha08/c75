import React from 'react';
import { Text, View, ScrollView,FlatList } from 'react-native';
import db from '../config';
import { Transition } from 'react-native-reanimated';
export default class Searchscreen extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      allTransactions:[],
      lastVisibleTransaction:null
    }
  }
    fetchMoreTransactions =async()=>{
      const query = await db.collection("transactions").startAfter(this.state.lastVisibleTransaction).limit(10).get()
      query.docs.map((doc)=>{
        this.setState({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction:doc
        })
      })
    }
    render() {
      return (
        
       <FlatList
         data={this.state.allTransactions}
           renderItem={({item})=>(
             <View key ={index} style = {{borderBottomWidth:2}}>
               <Text> {"Transaction Type:"+transaction.transactionType} </Text>
               <Text> {"BookId:"+transaction.bookId} </Text>
               <Text> {"StudentId:"+transaction.studentId} </Text>
               <Text> {"Date:"+transaction.date.toDate()} </Text>
             </View>
           )}
           keyExtractor={(item,index)=>index.toString()}
           onEndReached= {this.fetchMoreTransactions}
           onEndReachedThreshold = {0.7}
           >
       </FlatList>
      );
    }
  }