import React, {Component} from 'react';

import { 
  Text, 
  View, 
  Dimensions, 
  TouchableOpacity, 
  StyleSheet,  
  StatusBar,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';

import ChatSettings from './ChatSettings.js';

import RBSheet from 'react-native-raw-bottom-sheet';
import FastImage from 'react-native-fast-image';

import {useNavigation, useRoute} from '@react-navigation/native';
import {scaleFontSize} from '../../util/ScaleFontSize';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const array = ['#C717AC','#2A881E','#30A2D5','#E59232','#744504','#333333']

const findColor = () => {
  a =  Math.floor(Math.random() * 6)
  return array[a]
}

class Chat extends Component {
  
  constructor() {
    super()
    this.state={
      groupId: '',
      senderId: '',
      image: '',
      members: 0,
      name: '',
      joined: false,
      puddleName:'',
      memberCount:0,
      message:'',
      history:[]
  }}

  goBack = async(navigation) => {
    navigation.goBack();
  }

  openPanel = () => {
    this.RBSheet.open();
  }
  
  closePanel = () => {
    this.RBSheet.close();
  }

  storeInfo() {
    console.log(this.props.route.params.groupID)
    console.log(this.props.route.params.userID)
    console.log(this.props.route.params.members)
    console.log(this.props.route.params.name)
    console.log(this.props.route.params.joined)
    
    this.setState({
      groupId: this.props.route.params.groupID,
      senderId: this.props.route.params.userID,
      members: this.props.route.params.members,
      name: this.props.route.params.name,
      joined: this.props.route.params.joined,
      image: this.props.route.params.image,
     })
  }

  getPreviousMessages = async() => {

    var Message = Parse.Object.extend('Messages')
    var query = new Parse.Query(Message)

    query.equalTo('groupId', this.props.route.params.groupID)
  
    var results = await query.find() 
    
    var array = []

    for (let i=0; i < results.length; i++) {
      let thisObject = results[i]

      var details = Parse.Object.extend('User')
      var query = new Parse.Query(details)

      query.equalTo('objectId', thisObject.get('senderId'))
    
      var obj = await query.find()   
      for (let i=0; i < obj.length; i++) {
        let userdetail = obj[i]
        var a = userdetail.get('username') 
        var b = userdetail.get('image')
        var c = thisObject.get('Message')
        
        array.push({username:a, image:b, message:c})
      }
    }
    //console.log(array)
    this.setState({history:array})
  }

  async keepFetchingPreviousMessages() {
    
    let query = new Parse.Query('Messages');    
    query.equalTo('groupId', this.props.route.params.groupID)
    let sub = await query.subscribe();

    sub.on('open', () => {
      console.log('Subscription Opened');
    });

    sub.on('create', (object) => {
      this.createChatObject(object)
    });       
          
  }

  async componentDidMount() {

    this.storeInfo()
    this.getPreviousMessages()
    this.keepFetchingPreviousMessages()
    this.getPuddleInfo()
    
  }

  sendMessage = async() => {
    const params =  { groupId: this.state.groupId, 
                      senderId: this.state.senderId, 
                      message: this.state.message };
    const response = await Parse.Cloud.run("SendMessage", params);

    if(response['success'] == true) 
    { console.log("Message sent")
    }
    else
    { console.log("Message not sent!")
    } 
  } 

  async createChatObject(object) {
    //console.log(object)

    var data = JSON.stringify(object)
    data= JSON.parse(data)
    //console.log(data["Message"])
    //console.log(data["createdAt"])
    var details = Parse.Object.extend('User')
    var query = new Parse.Query(details)

    query.equalTo('objectId', data['senderId'])
    
    var obj = await query.find()   

    var array = this.state.history
    
    for (let i=0; i < obj.length; i++) {
      let userdetail = obj[i]
      var a = userdetail.get('username') 
      var b = userdetail.get('image')
      var c = data["Message"]
      
      array.push({username:a, image:b, message:c})
    }

    this.setState({history:array})
  }

  getPuddleInfo = async() => {
    var details = Parse.Object.extend('Puddle')
    var query = new Parse.Query(details)

    query.equalTo('objectId', this.props.route.params.groupID)
    
    var obj = await query.find()   

    for (let i=0; i < obj.length; i++) {
      let puddledetail = obj[i]
      var a = puddledetail.get('name') 
      var b = puddledetail.get('memberCount')
    }

    this.setState({puddleName:a, memberCount:b})
    //console.log(this.state.puddleName)
    //console.log(this.state.memberCount)
  }

  message = () => {
    return this.state.history.map((item,index) => {
      return(
        <View style={{ width: windowWidth, height: 63, 
                       marginLeft: 11, width: phoneWidth-22}}>
          <View style={{flexDirection: 'row',marginLeft: 19, alignItems: 'center', flex: 1, right: 11}}>
              <Image source={{uri: item["image"]}}
              style={{width:27, height:27, borderRadius:27/2, right:13, right:5}}/>

              <View style={{marginLeft:5, marginRight:11}}>
                  <Text style={{marginTop:6, fontSize:scaleFontSize(18), color:'#333333',fontWeight:'500'}}>{item["message"]}</Text>
                  <Text style={{marginTop:4, fontSize:scaleFontSize(18), color:'#333333' ,fontWeight:'500'}}>{item["username"]}</Text>
              </View>
          </View>         
        </View>
      )
    }) 
  }

  userJoinedView() {
    return (
      <View behavior="padding" style={{flex:1, width:'100%', height:'100%'}}>
        
        <View style={{ 
          height: windowHeight * 0.25, 
          width: windowWidth,
          justifyContent:'flex-end', flexDirection:'row'}}>
            
            <FastImage source={{uri:this.props.route.params.base64}}
              style={{height: windowHeight * 0.3, 
              width: windowWidth}}/>  

            <View style={{height: windowHeight * 0.065, justifyContent:'center',
                        position:'absolute',width: windowWidth * 0.075, left:15, 
                        marginTop:36}}>
              <TouchableOpacity onPress={() => this.goBack(this.props.navigation)}>
                <Image source = {require('../../assets/images/Chat/backbutton.png')} 
                      style={{height:windowHeight/16,
                      width:windowWidth/16, resizeMode:'contain'}}/>
              </TouchableOpacity>
            </View>

            <View style={{height: windowHeight * 0.065, justifyContent:'center',
                        position:'absolute',width: windowWidth * 0.075, right:10, 
                        marginTop:40}}>
              <TouchableOpacity onPress={() => this.openPanel()}>
                <Image source = {require('../../assets/images/Chat/puddlesettings.png')} 
                      style={{height:windowHeight/14,
                      width:windowWidth/14, resizeMode:'contain'}}/>
              </TouchableOpacity>
            </View>

            <View style={{bottom:30, left:20, position:'absolute', backgroundColor:'transparent'}}>
              <Text style={{fontSize:scaleFontSize(28), fontWeight:'600',color:'white'}}>
                {this.state.puddleName}</Text>
            </View>

            <View style={{bottom:6, left:20, position:'absolute', backgroundColor:'transparent'}}>
              <Image source = {require('../../assets/images/Chat/settings_members.png')} 
                     style={{height:windowHeight/22,
                     width:windowWidth/22, resizeMode:'contain'}}/>
            </View>

            <View style={{bottom:10, left:40, position:'absolute', backgroundColor:'transparent'}}>
              <Text style={{fontSize:scaleFontSize(18), fontWeight:'500',color:'white'}}>
                {this.state.memberCount} Members</Text>
            </View>

            {/* <View style={{backgroundColor:'green',height: windowHeight * 0.0025, 
                          width: windowWidth}}>
            </View> */}
            
        </View>

        <KeyboardAvoidingView behavior="padding" style={{ backgroundColor:'white',
          height: windowHeight * 0.75, justifyContent:'flex-end',
          width: windowWidth}}>
            <KeyboardAvoidingView>
            <ScrollView style={{marginTop:0, 
                                backgroundColor:'white',
                                height: windowHeight*0.66, 
                                width: windowWidth}}
              ref={ref => {this.scrollView = ref}}
              onContentSizeChange={() => this.scrollView.scrollToEnd({animated: true})}>
              {this.message()}
            </ScrollView>
            </KeyboardAvoidingView>

            <View style={{ 
                          height:windowHeight*0.075, width:windowWidth,
                          justifyContent:'space-between', flexDirection:'row'}}>
            
            
                <View style={{flex:0.9}}>

                  <View style={{flex:1, height:windowHeight*0.1,
                    marginHorizontal:8, backgroundColor:'#F6F6F6', 
                    marginVertical:5,
                    borderRadius:49, flexDirection:'row'}}>

                      <Image source = {require('../../assets/images/Chat/media.png')} 
                      style={{height:windowHeight/18,
                      width:windowWidth/18, resizeMode:'contain', left:10,
                      justifyContent:'center'}}/>

                      <View style={{left:14, justifyContent:'center', 
                                    marginRight:20, flex:1, left:16}}>
                        <TextInput 
                          placeholder='Have something to say?'
                          placeholderTextColor='#8E8E8E' 
                          value={this.state.message}
                          onChangeText={text => this.setState({message:text})}/>
                      </View>

                  </View>

                </View>  

                <View style={{flex:0.1, justifyContent:'center', alignItems:'center', right:4}}>
                  <TouchableOpacity onPress={() => {this.sendMessage(),
                                                    this.setState({message:""})}}>
                    <Image source = {require('../../assets/images/Chat/sendmessage.png')} 
                        style={{height:windowHeight/10,
                        width:windowWidth/10, resizeMode:'contain'}}/>
                  </TouchableOpacity>
                </View>           
            </View>
        </KeyboardAvoidingView>

      </View>
    )
  }
  
  userNotJoinedView() {
    return (
      <View style={{flex:1, width:'100%', height:'100%', backgroundColor:'green'}}>
        
      </View>
    )
  }

  render() {

    const {navigation} = this.props
    
    return(
      <View style={styles.container}>
        <StatusBar barStyle='light-content'/>

        {this.state.joined ? this.userJoinedView() : this.userJoinedView()}

        <RBSheet
          ref={ref => {
            this.RBSheet = ref;
          }}
          height={windowHeight}
          closeOnPressBack={true}
          closeOnPressMask={true}
          animationType="fade"
          duration={100}
          customStyles={{
            container: {
              borderTopLeftRadius: 19,
              borderTopRightRadius: 19,
              backgroundColor:'transparent'
            }
          }}>
            <ChatSettings openPanel={this.openPanel}
                          closePanel={this.closePanel}
                          userIdValue={this.props.route.params.userID}
                          groupIdValue={this.props.route.params.groupID}
                          navigation={this.props.navigation}/>
        </RBSheet>

      </View>
    )
  }
}

export default function(){
  const route = useRoute()
  const navigation = useNavigation()
  return <Chat route={route} navigation={navigation}/>
}

const styles = StyleSheet.create({

  container: {
    flex:1,
    height:'100%',
    width:'100%'
  }

})