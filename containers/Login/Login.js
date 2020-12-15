import React, {Component} from 'react';

import { 
  Text, 
  View, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  ScrollView, 
  TextInput, 
  ImageBackground, 
  StatusBar, 
  Image,
  Alert,
  DeviceEventEmitter
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-community/async-storage';
import {useNavigation} from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";

import styles1 from '../../styles/Login/styles1';
import Data from '../../util/Data';

var v1 = Data.FALSE
var v2 = Data.FALSE
var v3 = Data.FALSE
var connected = Data.TRUE

class Login extends Component {
    
  constructor(){
    super()
    this.state = {
      username:"",
      password:"",
      phoneno:"",
      secone:"",
      sectwo:"",
      ansone:"",
      anstwo:"",
      forgotButtonClicked: false,
      loginButtonClicked: false,
      createButtonClicked: false,
      nextButtonClicked:false,
      change:false,
      checkpassword:"",
      newpassword:"",
      dropdown: false,
      picked: false,
      a: "What is your childhood nickname?",
      b: "What's your favorite hobby?",
      c: "What is your pet's name?",
      d: "Which city were you born in?",
      dropdown2: false,
      picked2: false,
      online:true,
      serverurl:"",
      activate:false,
      enterbutton:false
    } 
  }

  login() {
    return(
      <KeyboardAvoidingView style={styles1.screen} behavior="padding">
        <View style={styles1.separate}></View>

        <ScrollView style={styles1.login}>  
         
         <View style={styles1.forgotstyle}>
          <TouchableOpacity onPress={() => this.setState({forgotButtonClicked: true})}>
            <Text style={styles1.forgottextstyle}>Forgot Password?</Text>
          </TouchableOpacity> 
          </View>

          <View style={styles1.parent}>
            <View style={styles1.input}>
              <View style={styles1.icon}>
                <Image source = {require('../../assets/images/Login/name.png')} style={styles1.iconstyle}/>
              </View>
              <View style={styles1.inputfield}>
                <TextInput style={styles1.inputtext} 
                  placeholder='Username or Phone Number' 
                  placeholderTextColor='#8E8E8E' 
                  value={this.state.username}
                  autoCapitalize="none"
                  onChangeText={text=> this.setState({username:text})}/>
              </View>
            </View>

            <View style={styles1.input}>
              <View style={styles1.icon}>
                <Image source = {require('../../assets/images/Login/password.png')} style={styles1.iconstyle}/>
              </View>
              <View style={styles1.inputfield}>
                <TextInput style={styles1.inputtext} 
                  placeholder='Password'
                  placeholderTextColor='#8E8E8E' 
                  secureTextEntry 
                  value={this.state.password}
                  onChangeText={text => this.setState({password:text})}/>  
              </View>      
            </View> 

            <View style={styles1.buttons}>
              <TouchableOpacity style={styles1.buttoncontainer1} onPress={() => this.createButtonPressed(this.props.navigation)}>
                  <Text style={styles1.buttontext1}>New account</Text>
              </TouchableOpacity>
            
              <View style={styles1.plain}></View>
              
              <TouchableOpacity style={{
                flexDirection:'row',
                justifyContent:'flex-end',
                flex:1,
                opacity: connected ? 1 : 0.5
              }} 
                onPress={() => this.UsernameorPhoneNumber()}
                disabled={!connected}>
                <LinearGradient style={styles1.logintext} start={{x:0,y:0}} end={{x:1,y:1}} colors={['#350078','#00FFFF']}>
                  <Text style={styles1.buttontext2}>Login</Text>
                  <View style={styles1.loginicon}><Image source = {require('../../assets/images/Login/login.png')} style={styles1.loginiconstyle}/></View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* <View style={styles1.faceid}>
              <TouchableOpacity>
                <View style={styles1.faceidcontainer}><Image source = {require('../../assets/images/Login/faceid.png')} style={styles1.faceidimage}/></View>
              </TouchableOpacity>
            </View> */}

            <View style={styles1.server}>
              { this.state.activate == true && this.state.enterbutton == true ? 
                <View style={styles1.settingsinput}>
                  <View style={styles1.inputfield}>
                    <TextInput style={styles1.settingsinputtext} 
                      placeholder='Enter the Server URL'
                      placeholderTextColor='#8E8E8E' 
                      value={this.state.serverurl}
                      onChangeText={text => this.setState({serverurl:text})}/>  
                  </View>      
                </View> 
              : null }

            { this.state.enterbutton == false ? 
            <TouchableOpacity style={styles1.settings} onPress={() => this.setState({activate:true, enterbutton:true})}>
              <Image source = {require('../../assets/images/Login/settings_gear.png')} style={styles1.settingsimage}/>
            </TouchableOpacity>
            :
            <TouchableOpacity style={styles1.settings} onPress={() => this.saveServerURL()}>
              <Text style={styles1.buttontext1}>Enter</Text>
            </TouchableOpacity> } 
           </View>

          </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )}
  
  forgotViewOne() {
    return(
      <View style={styles1.forgot}>
        <ScrollView>
        <View style={styles1.security}>
            <Text style={styles1.securitytext}>Forgot password?</Text>
        </View>

        <View style={styles1.input}>
          <View style={styles1.icon}>
            <Image source = {require('../../assets/images/Login/username.png')} style={styles1.iconstyle}/>
          </View>
          <View style={styles1.inputfield}>
            <TextInput style={styles1.inputtext} 
              placeholder='Enter your Username'
              placeholderTextColor='#8E8E8E' 
              value={this.state.username}
              autoCapitalize="none"
              onChangeText={text => this.setState({username:text})}/>
          </View>
        </View>

        <View style={styles1.input}>
          <View style={styles1.icon}>
            <Image source = {require('../../assets/images/Login/email.png')} style={styles1.iconstyle}/>
          </View>
          <View style={styles1.inputfield}>
            <TextInput style={styles1.inputtext} 
              placeholder='Enter your Phone Number'
              placeholderTextColor='#8E8E8E' 
              value={this.state.phoneno}
              onChangeText={number => this.setState({phoneno:number})}/>
          </View>
        </View> 

        <View style={styles1.forgotbuttons}>
          <TouchableOpacity style={styles1.buttoncontainer1} onPress={() => this.setState({forgotButtonClicked: false})}>
            <Text style={styles1.buttontext1}>Go back</Text>
          </TouchableOpacity>

          <View style={styles1.normal}></View>

          <View style={{
             marginLeft:25,
             flexDirection:'row',
             justifyContent:'flex-end',
             flex:1,
             opacity: v1 && connected ? 1 : 0.6
          }}>
            <TouchableOpacity disabled={!v1 && !connected} onPress={() => this.validationOne()}>
              <LinearGradient style={styles1.lineartext} start={{x:0,y:0}} end={{x:1,y:1}} colors={['#350078','#00FFFF']}>
                <Text style={styles1.buttontext3}>Next</Text>
                <View style={styles1.nexticon}>
                  <Image source = {require('../../assets/images/Login/forward.png')} style={styles1.nexticonstyle}/></View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      </View>
    )
  }

  forgotViewTwo() {
    
    return(
      <View style={styles1.forgot}> 
        <ScrollView>
          <View style={styles1.securityquestion}>
            <Text style={styles1.securityquestiontext}>Security Questions</Text>
          </View>  

          <TouchableOpacity style={styles1.questioninput} onPress={() => this.setState({dropdown:true})}>
            { this.state.picked == false ?
              <View style={styles1.drop}>
                <View style={styles1.option}>
                  <Text style={styles1.questiontext}>1. Pick an option</Text>
                </View>
                <View>
                  <Image source = {require('../../assets/images/Login/dropdown.jpg')} 
                        style={styles1.dropimage}/>
                </View>
              </View> 
              :
              <View style={styles1.drop}>
                <Text style={styles1.questiontext2}>{this.state.secone}</Text> 
                <View>
                  <Image source = {require('../../assets/images/Login/dropdown.jpg')} 
                         style={styles1.dropimage}/>
                </View>
              </View>
            }
          </TouchableOpacity> 

          { this.state.dropdown ? 
          <View>
            <TouchableOpacity style={styles1.menu} 
              onPress={() => this.setState({dropdown:false, picked:true, secone:this.state.a})}>
              <Text 
              style={styles1.questiontext}>{this.state.a}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles1.menu} 
              onPress={() => this.setState({dropdown:false, picked:true, secone:this.state.b})}>
              <Text style={styles1.questiontext}>{this.state.b}</Text>
            </TouchableOpacity>
          </View>
          :
          null
          }

          <View style={styles1.secinput}>
            <View style={styles1.icon}>
              <Image source = {require('../../assets/images/Login/password.png')} style={styles1.iconstyle}/>
            </View>
            <View style={styles1.inputfield}>
              <TextInput style={styles1.inputtext} 
                placeholder={'Security Answer 1'}
                placeholderTextColor='#8E8E8E' 
                value={this.state.ansone}
                autoCapitalize="none"
                onChangeText={text => this.setState({ansone:text})}/>
            </View>
          </View> 

          <TouchableOpacity style={styles1.questioninput} onPress={() => this.setState({dropdown2:true})}>
            { this.state.picked2 == false ?
              <View style={styles1.drop}>
                <View style={styles1.option}>
                  <Text style={styles1.questiontext}>2. Pick another option</Text>
                </View>
                <View>
                  <Image source = {require('../../assets/images/Login/dropdown.jpg')} 
                         style={styles1.dropimage}/>
                </View>
              </View>   
              :
              <View style={styles1.drop}>
                <Text style={styles1.questiontext2}>{this.state.sectwo}</Text> 
                <View>
                  <Image source = {require('../../assets/images/Login/dropdown.jpg')} 
                         style={styles1.dropimage}/>
                </View>
              </View>
            }
          </TouchableOpacity> 

          { this.state.dropdown2 ? 
          <View>
            <TouchableOpacity style={styles1.menu} 
              onPress={() => this.setState({dropdown2:false, picked2:true, sectwo:this.state.c})}>
              <Text 
              style={styles1.questiontext}>{this.state.c}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles1.menu} 
              onPress={() => this.setState({dropdown2:false, picked2:true, sectwo:this.state.d})}>
              <Text style={styles1.questiontext}>{this.state.d}</Text>
            </TouchableOpacity>
          </View>
          :
          null
          }

          <View style={styles1.secinput}>
            <View style={styles1.icon}>
              <Image source = {require('../../assets/images/Login/password.png')} style={styles1.iconstyle}/>
            </View>
            <View style={styles1.inputfield}>
            <TextInput style={styles1.inputtext} 
                placeholder='Security Answer 2'
                placeholderTextColor='#8E8E8E' 
                value={this.state.anstwo}
                autoCapitalize="none"
                onChangeText={text => this.setState({anstwo:text})}/>
            </View>
          </View>
       
          <View style={styles1.buttons2}>
            <TouchableOpacity style={styles1.buttoncontainer1} onPress={() => this.setState({nextButtonClicked:false})}>
              <Text style={styles1.buttontext1}>Go back</Text>
            </TouchableOpacity>

            <View style={styles1.normal}></View>

            <View style={{
                marginLeft:25,
                flexDirection:'row',
                justifyContent:'flex-end',
                flex:1,
                opacity: v2 && connected ? 1 : 0.6 }}>
              <TouchableOpacity disabled={!v2 && !connected} onPress={() => this.validationTwo()}>
                <LinearGradient style={styles1.lineartext} start={{x:0,y:0}} end={{x:1,y:1}} colors={['#350078','#00FFFF']}>
                  <Text style={styles1.buttontext3}>Next</Text>
                  <View style={styles1.nexticon}><Image source = {require('../../assets/images/Login/forward.png')} style={styles1.nexticonstyle}/></View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
                
        </ScrollView>
      </View>
    )
  }

  forgotViewThree() {
    return(
      <View style={styles1.forgot}>
        <ScrollView>
        <View style={styles1.reset}>
          <Text style={styles1.securityquestiontext}>Password Reset</Text>
        </View>  
        
        <View style={styles1.input}>
          <View style={styles1.icon}>
            <Image source = {require('../../assets/images/Login/password.png')} style={styles1.iconstyle}/>
          </View>
          <View style={styles1.inputfield}>
            <TextInput style={styles1.inputtext} 
              placeholder='Enter your new password'
              placeholderTextColor='#8E8E8E' 
              secureTextEntry 
              value={this.state.newpassword}
              onChangeText={text => this.setState({newpassword:text})}/>
          </View>        
        </View> 

        <View style={styles1.input}>
          <View style={styles1.icon}>
            <Image source = {require('../../assets/images/Login/password.png')} style={styles1.iconstyle}/>
          </View>
          <View style={styles1.inputfield}>
            <TextInput style={styles1.inputtext} 
              placeholder='Re-enter your new password'
              placeholderTextColor='#8E8E8E' 
              secureTextEntry 
              value={this.state.checkpassword}
              onChangeText={text => this.setState({checkpassword:text})}/>
          </View>        
        </View> 

        <View style={styles1.submitbutton}>       
          <LinearGradient style={{flexDirection:'column',
                                  borderRadius:40,
                                  justifyContent:'center',
                                  alignItems:'center',
                                  marginHorizontal:19,
                                  marginTop:19,
                                  marginBottom:70,
                                  width:130,
                                  opacity: v3 && connected ? 1 : 0.6}} 
            start={{x:0,y:0}} end={{x:1,y:1}} colors={['#350078','#00FFFF']}>

            <TouchableOpacity disabled={!v3 && !connected} onPress={() => this.changePassword()}>
              <Text style={styles1.buttontext4}>Submit</Text>
            </TouchableOpacity>

          </LinearGradient>      
        </View>

        </ScrollView> 
      </View>
    )
  }

  backtoLogin() {
    return(
      <View style={styles1.forgotscreen}>
        {this.forgotViewThree()}
      </View>
    )
  }

  forgotCheck() {
    return(
      <View style={styles1.forgotscreen}>
        {this.state.change ? this.backtoLogin() : this.forgotViewTwo()}
      </View>
    )
  }

  forgotPassword(){
    return(
      <KeyboardAvoidingView style={styles1.forgotscreen} behavior="padding">
        {this.state.nextButtonClicked ? this.forgotCheck() : this.forgotViewOne()}
      </KeyboardAvoidingView>
  )}
  

  saveServerURL = async() => {
    try {
      await AsyncStorage.setItem('serverURL', this.state.serverurl)
      this.setState({activate:false, enterbutton:false})
      global.Parse.serverURL = this.state.serverurl
    } 
    catch(error) {
      console.log(error)
    }
  }

  validationOne = async() => {
    
    const params =  { username: this.state.username, 
                      phoneno: this.state.phoneno };
    const response = await Parse.Cloud.run("ValidationOne", params);

    if (response['data'] == true) {
      { this.setState({nextButtonClicked:true}) }
    }
    else if (response['data'] == false) {
      { alert('This user does not exist.')}
    }
    
  }

  validationTwo = async() => {

    const params =  { username: this.state.username, phoneno: this.state.phoneno, 
                      secone: this.state.secone, ansone: this.state.ansone,
                      sectwo: this.state.sectwo, anstwo: this.state.anstwo};
    const response = await Parse.Cloud.run("ValidationTwo", params);

    if(response['success'] == true) 
      { this.setState({change:true}) }
    
    else 
      { alert('Invalid answer(s).')}  

  }

  changePassword = async() => {

    const params =  { username: this.state.username};
    const response = await Parse.Cloud.run("ValidationThree", params);

    if(response['success'] == true) 
     { if (this.state.newpassword == this.state.checkpassword)
       { this.validationOfNewPassword()} 
       else 
       { alert("Passwords do not match.")}
     }

    else 
      { alert("An error occured.")}
  
  }

  validatePassword = password => {
    var re = /^[a-zA-Z0-9_. ]{8,30}$/;
    return re.test(password);
  };

  validationOfNewPassword() {
    var error = ''
    var a = ''

    if (!this.validatePassword(this.state.newpassword)) {
      var pw = ' Use an uppercase letter, a number and minimum 8 characters for the Password.'
      a = error.concat(pw) 
      alert(a) }
    else 
      { this.setState({password: this.state.newpassword})
        this.updateObject() }
  }
  
  updateObject = async() => {
    const params =  { username: this.state.username, password: this.state.password};
    const response = await Parse.Cloud.run("ForgotPassword", params);

    if(response['success'] == true) {   
      ( 
        Alert.alert(
          "Password Reset",
          "Password change successful.",
          [
            { text: "Okay", onPress: () => 
            {this.setState({
              forgotButtonClicked:false, 
              nextButtonClicked:false,
              change:false,
              phoneno:"", 
              secone:"1. Pick an option",
              sectwo:"2. Pick another option",
              ansone:"", 
              anstwo:"", 
              newpassword:"", 
              checkpassword:""})
            this.loginButtonPressed(this.props.navigation)}}
          ],
          {cancelable:false}
        ) 
      )
    }
    else {
      alert("An error occured. Please try again later.")
    }
  }

  validatePhoneNo = phoneno => {
    var re = /^[\+]?\d{10,12}$/;
    return re.test(phoneno);
  };

  UsernameorPhoneNumber = async() => {

    const i = this.state.username
    //console.log(i)

    if (!this.validatePhoneNo(this.state.username)) {
      //console.log("It's the username")
      if (this.state.username != "" && this.state.password != "")
        { this.loginButtonPressed(this.props.navigation) }
      else { alert("Please enter all fields.")}
    }
    else 
    { const params =  { username: this.state.username}
      const response = await Parse.Cloud.run("LoginUsingPhoneNumber", params);

      if(response['success'] == false) {
        alert("An error occured. Please try again later.")
      }
      else {
        //console.log(response)
        this.callfunction(response['data'])
      }
      //console.log("It's the phone number")
    }
  }

  state = {
   b:""
  }

  callfunction(b) {
     this.setState({username:b})
     //console.log(this.state.username)
     this.loginButtonPressed(this.props.navigation)

  }

  loginButtonPressed = async (navigation) => {

    const params =  { username: this.state.username, password: this.state.password};
    const response = await Parse.Cloud.run("Login", params);
    
    if(response['success'] == true) {
      if (response['data'].get('disable') !== true) {
        var objId = response['data'].id
        var username = response['data'].get('username')
        var fullname = response['data'].get('fullname')
        var email = response['data'].get('email')
        var phoneno = response['data'].get('phoneno')
        var bio = response['data'].get('bio')
        var image = response['data'].get('image') 

        // var session = response['data'].getSessionToken()
        // console.log(session)

        this.storeId(objId, username, fullname, email, phoneno, bio, image)
        this.setState({username:"", phoneno:"", password:""})
        
        await Parse.Cloud.run("New1");
        //await Parse.Cloud.run("New2");

        navigation.navigate('Puddle') 
      }
      else {
        alert("This account has been disabled.")
      }
    }
    if (response['success'] == false) {
      alert("Invalid details.")
    }

  }

  storeId = async(a,b,c,d,e,f,g) => {
    try {
      await AsyncStorage.setItem('objectId', a)
      await AsyncStorage.setItem('username', b)
      await AsyncStorage.setItem('fullname', c)
      await AsyncStorage.setItem('email', d)
      await AsyncStorage.setItem('phoneno', e)
      await AsyncStorage.setItem('signedIn', "Puddle")

      if (f !== null) {
        await AsyncStorage.setItem('bio', f)
      }
      if (g !== "data:;base64,") {
        await AsyncStorage.setItem('img', g)
      }
    } 
    catch(error) {
      console.log(error)
    }
  }

  createButtonPressed = async(navigation) => {
    this.setState({createButtonClicked:true})
    navigation.navigate('UserAccount')
  }

  navigatetoHome = async(navigation) => {
    navigation.navigate('Puddle')
  }

  getServerURL = async() => {
    const retrievedItem = await AsyncStorage.getItem('serverURL');

    if (retrievedItem !== '')
    {this.setState({serverURL:retrievedItem})
     global.Parse.serverURL = retrievedItem}
  }

  componentDidMount() {
    const unsubscribe = NetInfo.addEventListener(state => {
      this.setState({online: state.isConnected});
    });
    this.getServerURL()

    DeviceEventEmitter.addListener('storeInstanceId', (event) => {
      ToastModule.showText(`Hi : ${JSON.stringify(event)}`, ToastModule.LENGTH_LONG);
    });

  }

  render() {
   
    const {navigation} = this.props
    connected = this.state.online

    v1 = this.state.username && this.state.phoneno
    v2 = this.state.ansone && this.state.anstwo
    v3 = this.state.newpassword && this.state.checkpassword

    return(
      <KeyboardAvoidingView style={styles1.container} behavior="padding"> 
        <StatusBar barStyle="light-content"/>
          <ImageBackground source = {require('../../assets/images/Login/loginbackground.png')} style={styles1.back}>
            {this.state.forgotButtonClicked ? this.forgotPassword() : this.login()}
          </ImageBackground>
      </KeyboardAvoidingView>
    )
  }
}

export default function(){
  const navigation = useNavigation()
  return <Login navigation={navigation}/>
}