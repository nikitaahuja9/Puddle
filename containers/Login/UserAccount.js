import React, {Component} from 'react';

import {
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  ImageBackground, 
  StatusBar, 
  Image, 
  KeyboardAvoidingView,
  Keyboard
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";

import styles2 from '../../styles/Login/styles2';
import Data from '../../util/Data';

var v1 = Data.FALSE
var connected = Data.TRUE

class UserAccount extends Component {

  constructor() {
    super()
    this.state={
      fullname:"",
      username:"",
      password:"",
      email:"",
      phoneno:"",
      secone:"",
      sectwo:"",
      ansone:"",
      anstwo:"",
      goBackButtonClicked: false,
      usernameValidationDone: false,
      fullnameValidationDone: false,
      emailValidationDone: false,
      passwordValidationDone: false,
      phonenoValidationDone: false,
      seconeValidationDone:false,
      sectwoValidationDone:false,
      nextview: false,
      dropdown: false,
      picked: false,
      a: "What is your childhood nickname?",
      b: "What's your favorite hobby?",
      c: "What is your pet's name?",
      d: "Which city were you born in?",
      dropdown2: false,
      picked2: false,
      online: true
  }}

  goback = async (navigation) => {
    navigation.goBack();
  };
  
  validateUsername = username => {
    var re = /^[a-zA-Z0-9_.-]{3,13}$/;
    return re.test(username);
  };

  validateFullname = fullname => {
    var re = /^[a-zA-Z' ]{2,30}$/;
    return re.test(fullname);
  };

  validateEmail = email => {
    var re = /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  validatePassword = password => {
    var re = /^[a-zA-Z0-9_. ]{8,30}$/;
    return re.test(password);
  };

  validatePhoneNo = phoneno => {
    var re = /^[\+]?\d{10,15}$/;
    return re.test(phoneno);
  };

  validateAnsOne = ansone => {
    var re = /^[a-zA-Z' ]{3,30}$/;
    return re.test(ansone);
  };

  validateAnsTwo = anstwo => {
    var re = /^[a-zA-Z' ]{3,30}$/;
    return re.test(anstwo);
  };

  validationOne() {
    var error = ''
    var a = ''
    var b = ''
    var c = ''
    var d = ''
    var e = ''
    var check = ''

    if (!this.validateUsername(this.state.username)) {
      var un = 'Username must be 4 characters long.'
      var a = error.concat(un) }
    else 
      (this.setState({usernameValidationDone:true}) )
    
    if (!this.validateFullname(this.state.fullname)) {
      var fn = ' Invalid Display Name format.'
      var b = error.concat(fn) }
    else 
      (this.setState({fullnameValidationDone:true}) )

    if (!this.validateEmail(this.state.email)) {
      var em = ' Invalid Email Address format.'
      var c = error.concat(em) }
    else 
      (this.setState({emailValidationDone:true}) )

    if (!this.validatePhoneNo(this.state.phoneno)) {
      var ph = ' Invalid Phone Number.'
      var d = error.concat(ph)
       }
    else 
      ( this.setState({phonenoValidationDone:true}) )

    if (!this.validatePassword(this.state.password)) {
      var pw = ' Use an uppercase letter, a number and minimum 8 characters for the Password.'
      var e = error.concat(pw) }
    else 
      (this.setState({passwordValidationDone:true}) )

    if ((this.state.usernameValidationDone == true) && (this.state.fullnameValidationDone == true) 
        && (this.state.emailValidationDone == true) && (this.state.passwordValidationDone == true)
        && (this.state.phonenoValidationDone == true))
      {  (this.setState({nextview:true})) }
    
    else {
      if(check.concat(a,b,c,d, e) != '') {
        alert(check.concat(a,b,c,d,e)) 
      }
      else {
        (this.setState({nextview:true})) 
      }
    }
  }

  validationTwo() {
    var error = ''
    var a = ''
    var b = ''
    var c = ''
    var d = ''
    var check = ''

    if (!this.validateAnsOne(this.state.ansone)) {
      var s1 = 'Invalid Answer 1 format.'
      var a = error.concat(s1) }
    else 
      (this.setState({seconeValidationDone:true}) )

    if (!this.validateAnsTwo(this.state.anstwo)) {
      var s2 = ' Invalid Answer 2 format.'
      var b = error.concat(s2) }
    else 
      (this.setState({sectwoValidationDone:true}) )

    if ((this.state.seconeValidationDone == true) && (this.state.sectwoValidationDone == true)) 
      { 
        this.sendData() 
      }
    else {
      if(check.concat(a,b) != '') {
        alert(check.concat(a,b)) 
      }
      else {
        this.sendData()
      }
    }
  }

  sendData() {
    this.setState({username: this.state.username})
    this.setState({fullname:this.state.fullname})
    this.setState({email: this.state.email})
    this.setState({phoneno: this.state.phoneno})
    this.setState({password: this.state.password})
    this.setState({secone: this.state.secone})
    this.setState({sectwo: this.state.sectwo})
    this.setState({ansone: this.state.ansone})
    this.setState({anstwo: this.state.anstwo})
    this.onButtonPress()    
  }
  
  onButtonPress = async () => {
    const params =  { fullname: this.state.fullname, 
                      username: this.state.username,
                      password: this.state.password,
                      phoneno: this.state.phoneno, 
                      email: this.state.email,
                      secone: this.state.secone,
                      sectwo: this.state.sectwo,
                      ansone: this.state.ansone,
                      anstwo: this.state.anstwo,
                      color: Data.USR_COLOR[Math.floor(Math.random() * 6)]
                    };
    const response = await Parse.Cloud.run("CreateAccount", params);

    if(response['success'] == true) {
      this.loginNow(this.props.navigation)
    }
    else {
      alert("Account already exists for this username.")
    }
  
  }

  loginNow = async (navigation) => {

    const params =  { username: this.state.username, password: this.state.password};
    const response = await Parse.Cloud.run("Login", params);
    
    if(response['success'] == true) {
      var objId = response['data'].id
      var username = response['data'].get('username')
      var fullname = response['data'].get('fullname')
      var email = response['data'].get('email')
      var phoneno = response['data'].get('phoneno')

      this.storeId(objId, username, fullname, email, phoneno)
      navigation.navigate('Puddle')
    }
    if (response['success'] == false) {
      alert("Invalid details.")
    }

  }

  storeId = async(a,b,c,d,e) => {
    try {
      await AsyncStorage.setItem('objectId', a)
      await AsyncStorage.setItem('username', b)
      await AsyncStorage.setItem('fullname', c)
      await AsyncStorage.setItem('email', d)
      await AsyncStorage.setItem('phoneno', e)
      await AsyncStorage.setItem('signedIn', "Puddle")
    } 
    catch(error) {
      console.log(error)
    }
  }

  firstview() {
    return(
      <View style={styles2.first} behavior="padding"> 
        <ScrollView style={styles2.scroll}>

          <View style={styles2.input}>
            <View style={styles2.icon}>
              <Image source = {require('../../assets/images/Login/username.png')} style={styles2.iconstyle}/>
            </View>
            <View style={styles2.inputfield}>
              <TextInput style={styles2.inputtext} 
                placeholder='Username' 
                placeholderTextColor='#8E8E8E' 
                value={this.state.username}
                autoCapitalize="none"
                onChangeText={text => this.setState({username: text})}/>
            </View>
          </View>

          <View style={styles2.input}>
            <View style={styles2.icon}>
              <Image source = {require('../../assets/images/Login/name.png')} style={styles2.iconstyle}/>
            </View>
            <View style={styles2.inputfield}>
              <TextInput style={styles2.inputtext} 
                placeholder='Full Name'
                placeholderTextColor='#8E8E8E' 
                value={this.state.fullname}
                onChangeText={text => this.setState({fullname: text})}/>
            </View>        
          </View> 

          <View style={styles2.input}>
            <View style={styles2.icon}>
              <Image source = {require('../../assets/images/Login/email.png')} style={styles2.iconstyle}/>
            </View>
            <View style={styles2.inputfield}>
              <TextInput style={styles2.inputtext} 
                placeholder='Email Address'
                placeholderTextColor='#8E8E8E' 
                value={this.state.email}
                autoCapitalize="none"
                onChangeText={text => this.setState({email:text})}/>
            </View>  
          </View> 

          <View style={styles2.input}>
            <View style={styles2.icon}>
              <Image source = {require('../../assets/images/Login/email.png')} style={styles2.iconstyle}/>
            </View>
            <View style={styles2.inputfield}>
              <TextInput style={styles2.inputtext} 
                placeholder='Phone Number'
                placeholderTextColor='#8E8E8E' 
                value={this.state.phoneno}
                onChangeText={number => this.setState({phoneno:number})}/>
            </View>  
          </View> 

          <View style={styles2.input}>
            <View style={styles2.icon}>
              <Image source = {require('../../assets/images/Login/password.png')} style={styles2.iconstyle}/>
            </View>
            <View style={styles2.inputfield}>
              <TextInput style={styles2.inputtext} 
                placeholder='Password'
                placeholderTextColor='#8E8E8E' 
                secureTextEntry 
                value={this.state.password}
                onChangeText={text => this.setState({password:text})}/>  
            </View>        
          </View> 

          <View style={{
            marginRight:19,
            marginTop:30,
            marginLeft:19,
            marginBottom:70,
            flexDirection:'row',
            justifyContent:'flex-end',
            height:20, 
            bottom:10,
            opacity: v1 && connected ? 1 : 0.6
          }}>
            <TouchableOpacity disabled={!v1 && !connected} onPress={() => this.validationOne()}>
              <LinearGradient style={styles2.lineartext} start={{x:0,y:0}} end={{x:1,y:1}} colors={['#350078','#00FFFF']}>
                <Text style={styles2.buttontext2}>Next</Text>
                <View style={styles2.nexticon}><Image source = {require('../../assets/images/Login/forward.png')} style={styles2.nexticonstyle}/></View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    )
  }

  replaceview() {
    
    return(
      <View style={styles2.first} behavior="padding"> 
        <ScrollView style={styles2.scroll}>

          <View style={styles2.securityquestion}>
            <Text style={styles2.securityquestiontext}>Security Questions</Text>
          </View>  

          <TouchableOpacity style={styles2.questioninput} onPress={() => this.setState({dropdown:true})}>
            { this.state.picked == false ?
              <View style={styles2.drop}>
                <View style={styles2.drop}>
                  <Text style={styles2.questiontext}>1. Pick an option</Text>
                </View>
                <View>
                  <Image source = {require('../../assets/images/Login/dropdown.jpg')} 
                        style={styles2.dropimage}/>
                </View>
              </View> 
              :
              <View style={styles2.drop}>
                <Text style={styles2.questiontext2}>{this.state.secone}</Text> 
                <View>
                  <Image source = {require('../../assets/images/Login/dropdown.jpg')} 
                         style={styles2.dropimage}/>
                </View>
              </View>
            }
          </TouchableOpacity> 

          { this.state.dropdown ? 
          <View>
            <TouchableOpacity style={styles2.menu} 
              onPress={() => this.setState({dropdown:false, picked:true, secone:this.state.a})}>
              <Text 
              style={styles2.questiontext}>{this.state.a}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles2.menu} 
              onPress={() => this.setState({dropdown:false, picked:true, secone:this.state.b})}>
              <Text style={styles2.questiontext}>{this.state.b}</Text>
            </TouchableOpacity>
          </View>
          :
          null
          }

          <View style={styles2.secinput}>
            <View style={styles2.icon}>
              <Image source = {require('../../assets/images/Login/password.png')} style={styles2.iconstyle}/>
            </View>
            <View style={styles2.inputfield}>
              <TextInput style={styles2.inputtext} 
                placeholder={'Security Answer 1'}
                placeholderTextColor='#8E8E8E' 
                value={this.state.ansone}
                autoCapitalize="none"
                onChangeText={text => this.setState({ansone:text})}/>
            </View>
          </View> 

          <TouchableOpacity style={styles2.questioninput} onPress={() => this.setState({dropdown2:true})}>
            { this.state.picked2 == false ?
              <View style={styles2.drop}>
                <View style={styles2.option}>
                  <Text style={styles2.questiontext}>2. Pick another option</Text>
                </View>
                <View>
                  <Image source = {require('../../assets/images/Login/dropdown.jpg')} 
                         style={styles2.dropimage}/>
                </View>
              </View> 
              :
              <View style={styles2.drop}>
                <Text style={styles2.questiontext2}>{this.state.sectwo}</Text> 
                <View>
                  <Image source = {require('../../assets/images/Login/dropdown.jpg')} 
                         style={styles2.dropimage}/>
                </View>
              </View>
            }
          </TouchableOpacity> 

          { this.state.dropdown2 ? 
          <View>
            <TouchableOpacity style={styles2.menu} 
              onPress={() => this.setState({dropdown2:false, picked2:true, sectwo:this.state.c})}>
              <Text 
              style={styles2.questiontext}>{this.state.c}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles2.menu} 
              onPress={() => this.setState({dropdown2:false, picked2:true, sectwo:this.state.d})}>
              <Text style={styles2.questiontext}>{this.state.d}</Text>
            </TouchableOpacity>
          </View>
          :
          null
          }

          <View style={styles2.secinput}>
            <View style={styles2.icon}>
              <Image source = {require('../../assets/images/Login/password.png')} style={styles2.iconstyle}/>
            </View>
            <View style={styles2.inputfield}>
            <TextInput style={styles2.inputtext} 
                placeholder='Security Answer 2'
                placeholderTextColor='#8E8E8E' 
                value={this.state.anstwo}
                autoCapitalize="none"
                onChangeText={text => this.setState({anstwo:text})}/>
            </View>
          </View>

          <TouchableOpacity style={{height:48,
                                    marginTop:30,
                                    marginBottom:70,
                                    marginHorizontal:19,
                                    flexDirection:'row',
                                    justifyContent:'flex-end',
                                    opacity: connected ? 1 : 0.6}} 
            onPress={() => this.validationTwo()}
            disabled={!connected}>
            <LinearGradient style={styles2.jumptext} start={{x:0,y:0}} end={{x:1,y:1}} colors={['#350078','#00FFFF']}>
              <Text style={styles2.buttontext}>Jump in the puddle</Text>
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </View>
    )
  }

  creation() {
    return(
      <KeyboardAvoidingView style={styles2.panelview} behavior="padding">

        <TouchableOpacity style={styles2.backbutton} onPress={() => this.goback(this.props.navigation)}>
          <View style={styles2.gobackicon}>
            <Image source = {require('../../assets/images/Login/goback.png')} 
                   style={styles2.gobackiconstyle}/>
          </View>
          <Text style={styles2.backbuttontext}>New Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{flex:0.28}} onPress={() => Keyboard.dismiss()}> 
        </TouchableOpacity>
       
        {this.state.nextview ? this.replaceview() : this.firstview()}
      
      </KeyboardAvoidingView>
    )
  }

  componentDidMount() {
    const unsubscribe = NetInfo.addEventListener(state => {
      this.setState({online: state.isConnected});
    });
  }

  render() {
    
    const {navigation} = this.props

    v1 = this.state.username && this.state.fullname && this.state.email && 
         this.state.phoneno && this.state.password 

    connected = this.state.online

    return(  
      <KeyboardAvoidingView style={styles2.container} behavior="padding"> 
        <StatusBar barStyle="light-content"/>
          <ImageBackground source = {require('../../assets/images/Login/background.png')} style={styles2.back}>
            {this.state.goBackButtonClicked ? this.goback() : this.creation()} 
          </ImageBackground>
      </KeyboardAvoidingView>
    )
  }
}

export default function() {
  const navigation = useNavigation()
  return <UserAccount navigation={navigation}/>
}