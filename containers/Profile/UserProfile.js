import React, {Component} from 'react';

import { 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  Alert
} from 'react-native';

import AccountSettings from '../../views/Profile/AccountSettings';
import SocialLinks from '../../views/Profile/SocialLinks';

import AsyncStorage from '@react-native-community/async-storage';
import ToggleSwitch from 'toggle-switch-react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import Lightbox from 'react-native-lightbox';

import {useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";

import styles1 from '../../styles/Profile/styles1';
import ScreenDimensions from '../../util/ScreenDimensions';
import Data from '../../util/Data';

var connected = Data.TRUE
class UserProfile extends Component {
  
  constructor() {
    super()
    this.state={
    fullname:"",
    bio:"",
    objectId:"",
    i:"", 
    isActive:false,
    image:`data:;base64,`,
    panelview:false,
    online:true
  }}

  goback = async (navigation) => {
    this.props.route.params.changeDp(this.state.image)
    navigation.goBack();
  };

  editprofile = async(navigation) => {
    navigation.navigate("Profile")
  }

  async retrieveItem() {
    try {
      const retrieveditem1 = await AsyncStorage.getItem('username');
      if (retrieveditem1 !== null)
      {this.setState({i:retrieveditem1})}
      
      const retrievedItem2 = await AsyncStorage.getItem('fullname');
      if (retrievedItem2 !== null)
      {this.setState({fullname:retrievedItem2})}

      const retrievedItem3 = await AsyncStorage.getItem('img');
      if (retrievedItem3 !== 'data:;base64,')
      {this.setState({image:retrievedItem3})}

      const retrievedItem4 = await AsyncStorage.getItem('bio');
      if (retrievedItem4 !== '')
      {this.setState({bio:retrievedItem4})}
    } 
    catch (error) {
      console.log(error);
    }
  }

  fetchProfileDetails = async() => {
    const retrievedItem = await AsyncStorage.getItem('objectId');
    
    {this.setState({objectId:retrievedItem})}

    const params =  { username: this.state.i };
    const response = await Parse.Cloud.run("ProfileDetails", params);
    
    if(response['success'] == true) {

      var a = response['data'][0]
      if (a !== null)
        {this.setState({fullname:a})}

      var b = response['data'][1]
      if (b !== null)
        {this.setState({bio:b})}

      var c = response['data'][3]
      if (c !== null)
        {this.setState({image:c})}

    }
    else if (response['success'] == false) {
      alert("Invalid details.")
    }
  }

  fetchDP = async(img) => {
    this.setState({
      image: img
    })
  }

  fetchFullname = async(fullname) => {
    this.setState({
      fullname: fullname
    })
  }

  fetchBio = async(bio) => {
    this.setState({
      bio: bio
    })
  }

  async componentDidMount() {

    this.retrieveItem()    
    this.fetchProfileDetails()

    const unsubscribe = NetInfo.addEventListener(state => {
      this.setState({online: state.isConnected});
    });

  }

  openPanel = () => {
    this.RBSheet.open();
  };
  
  closePanel = () => {
    this.RBSheet.close();
  };

  optionOne() {
    this.setState({panelview:true})
    this.openPanel()
  }

  optionTwo() {
    this.setState({panelview:false})
    this.openPanel()
  }

  viewOne = () => {
    return(
      <AccountSettings 
      closePanel={this.closePanel} 
      navigation={this.props.navigation}/>
    )
  }

  viewTwo = () => {
    return(
      <SocialLinks 
      closePanel={this.closePanel} 
      navigation={this.props.navigation}
      username={this.state.i}/>
    )
  }

  logout = async(navigation) => {
    const params =  { username: this.state.i};
    const response = await Parse.Cloud.run("Logout", params);

    if (response['success'] == true) 
    { this.signOut()
      navigation.navigate("Login") }

    else if (response['success'] == false)
    { alert("An error occured. Please try again later.")
    } 

  }

  signOut = async() => {
    try {
      await AsyncStorage.setItem('signedIn', "Login")
      await AsyncStorage.setItem('username', "")
      await AsyncStorage.setItem('fullname', "")
      await AsyncStorage.setItem('img', `data:;base64,`)
      await AsyncStorage.setItem('bio', "")
    }
    catch(error) {
      console.log(error)
    }
  }

  displayPicture() {
    return (
      <View style={styles1.picture}>
        
        <Lightbox springConfig={{tension:10000000, friction: 8000}} 
                  underlayColor="transparent"
                  renderContent={() => 
            <Image source={{uri: this.state.image}} 
                  style={{height:ScreenDimensions.windowHeight * 0.5, 
                          width:ScreenDimensions.windowWidth}}/>

        }>

        { this.state.image !== `data:;base64,` ?
          <Image source={{uri: this.state.image}}
                 style={styles1.dpimage}/> 
          :
          <Image source = {require('../../assets/images/Profile/noPic.png')}
                 style={styles1.bgimage}/>
        }
         
        </Lightbox>

      </View>  
    )
  }

  render() {

    const {navigation} = this.props
    
    connected = this.state.online

    return(
    <View style={styles1.container}> 
      <StatusBar barStyle="dark-content"/>
        
        <View style={styles1.mainview}>

          <TouchableOpacity style={{
            backgroundColor:'red', 
            width:ScreenDimensions.windowWidth,
            position:'absolute',
            opacity: connected == false ? 1 : 0}}
            disabled={!connected}>
            <Text style={styles1.nointernet}>
              Waiting for network..
            </Text>
          </TouchableOpacity>
          
          <View style={styles1.topview}>
            
            <View style={styles1.pos}>
              <TouchableOpacity onPress={() => this.goback(this.props.navigation)}> 
                <Image source = {require('../../assets/images/Profile/back_black.png')} 
                       style={styles1.backbutton}/>
              </TouchableOpacity>
        
              <TouchableOpacity 
               onPress={() => this.props.navigation.navigate('Profile', 
                        {fetchDP: this.fetchDP.bind(this),
                         fetchFullname: this.fetchFullname.bind(this),
                         fetchBio: this.fetchBio.bind(this)})}> 
                <Image source = {require('../../assets/images/Profile/profile_edit.png')} 
                style={styles1.navimage}/>
              </TouchableOpacity>
            </View>
            
            <View style={styles1.center}>
    
              {this.displayPicture()}
          
              <View resizeMode='contain' style={styles1.username}>
                <TouchableOpacity resizeMode='contain'>
                <Text allowFontScaling={true} adjustsFontSizeToFit={true} 
                      style={styles1.usernametext}>
                      {this.state.fullname}</Text>
                </TouchableOpacity>
              </View>

              <View resizeMode='contain' style={styles1.fullname}>
                <TouchableOpacity resizeMode='contain'>
                <Text allowFontScaling={true} adjustsFontSizeToFit={true} 
                      style={styles1.fullnametext}>
                      {this.state.i}</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>

          <View style={styles1.remainder}>
            
            <View style={styles1.bio}>
              <Text style={styles1.biotext}>
                {this.state.bio}
              </Text>
            </View>
          </View>
        
        </View>

        <View style={styles1.bottomview}>
          
          <View style={styles1.heading}>
            <Text style={styles1.headingtext}>Settings</Text>
          </View>  

          {/* <View style={styles1.newcontainer}>
            
            <View style={styles1.icon}>
              <Image source = {require('../../assets/images/Profile/profile_display.png')} style={styles1.iconstyle}/>
            </View>
            
            <View style={styles1.darkmode}>
              <TouchableOpacity 
                style={styles1.darkmodeallign}>
                <Text style={styles1.settingstext}>Dark Mode</Text>
              </TouchableOpacity>
            
              <ToggleSwitch
                isOn={this.state.isActive}
                onColor="#1B7BB9"
                offColor="#D7D6D7"
                labelStyle={{ color: "black", fontWeight: "900" }}
                size="small"
                onToggle={state => this.setState({isActive:state})}/>
              </View>
          </View>  */}

          <View style={styles1.input}>
            <View style={styles1.icon}>
              <Image source = {require('../../assets/images/Profile/profile_notifications.png')} style={styles1.iconstyle}/>
            </View>
            <TouchableOpacity style={styles1.settings}>
              <Text style={styles1.settingstext}>Notification Preferences</Text>
            </TouchableOpacity>
          </View> 

          <View style={styles1.input}>
            <View style={styles1.icon}>
              <Image source = {require('../../assets/images/Profile/profile_account.png')} style={styles1.iconstyle}/>
            </View>
            <TouchableOpacity style={styles1.settings}
              onPress={() => 
                { connected == true ? 
                this.optionOne()
                :
                ( Alert.alert(
                  "No Internet Connection",
                  "Check your internet connection and try again",
                  [
                    { text: "Okay" }
                  ],
                  {cancelable:false}
                )) }}>
              <Text style={styles1.settingstext}>Account Settings</Text>
            </TouchableOpacity>
          </View> 

          <View style={styles1.input}>
            <View style={styles1.icon}>
              <Image source = {require('../../assets/images/Profile/profile_social.png')} style={styles1.iconstyle}/>
            </View>
            <TouchableOpacity style={styles1.settings}
               onPress={() => 
                { connected == true ? 
                this.optionTwo()
                :
                ( Alert.alert(
                  "No Internet Connection",
                  "Check your internet connection and try again",
                  [
                    { text: "Okay" }
                  ],
                  {cancelable:false}
                )) }}>
              <Text style={styles1.settingstext}>Social Media Links</Text>
            </TouchableOpacity>
          </View> 
          
          <View style={styles1.input}>
            <View style={styles1.icon}>
              <Image source = {require('../../assets/images/Profile/profile_logout.png')} style={styles1.iconstyle}/>
            </View>
            <TouchableOpacity style={styles1.settings}
               onPress={() => 
                { connected == true ? 
                  this.logout(this.props.navigation)
                :
                ( Alert.alert(
                  "No Internet Connection",
                  "Check your internet connection and try again",
                  [
                    { text: "Okay" }
                  ],
                  {cancelable:false}
                )) }}>
              <Text style={styles1.logouttext}>Logout</Text>
            </TouchableOpacity>
          </View> 

        </View>

        <RBSheet
          ref={ref => {
            this.RBSheet = ref;
          }}
          height={ScreenDimensions.windowHeight/1.85}
          animationType="fade"
          duration={30}
          customStyles={{
            container: {
              borderTopLeftRadius: 19,
              borderTopRightRadius: 19,
              backgroundColor:'white'
            }
          }}>
          { this.state.panelview ? this.viewOne() : this.viewTwo() }
        </RBSheet>

      </View>
    )
  }
}

export default function() {
  const navigation = useNavigation()
  const route = useRoute()  
  return <UserProfile navigation={navigation} route={route}
  />
}