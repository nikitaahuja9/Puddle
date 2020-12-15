import React, {Component} from 'react';

import { 
  Text, 
  View, 
  TextInput,
  TouchableOpacity, 
  ScrollView, 
  Image, 
  StatusBar
} from 'react-native';

import ImagePicker from 'react-native-image-crop-picker';
import ActionSheet from 'react-native-actionsheet';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";

import {useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';

import styles2 from '../../styles/Profile/styles2';
import ScreenDimensions from '../../util/ScreenDimensions';
import Data from '../../util/Data';

var connected = Data.TRUE
class Profile extends Component {
  
  constructor() {
    super()
    this.state={
    fullname:"",
    bio:"",
    phoneno:"",
    fullnameValidationDone:"",
    phonenoValidationDone:"",
    bioValidationDone:"",
    base64string:"",
    mime:"", 
    picture:{},
    imageClicked:false, 
    objectId:"",
    i:"", 
    j:"",
    img: `data:;base64,`,
    online:true
  }}

  async retrieveItems() {
    try {

    const retrievedItem1 = await AsyncStorage.getItem('username');
    if (retrievedItem1 !== null)
    {this.setState({i:retrievedItem1})}
    
    const retrievedItem2 = await AsyncStorage.getItem('email');
    if (retrievedItem2 !== null)
    {this.setState({j:retrievedItem2})}
    
    const retrievedItem3 = await AsyncStorage.getItem('fullname');
    if (retrievedItem3 !== null)
    {this.setState({fullname:retrievedItem3})}

    const retrievedItem4 = await AsyncStorage.getItem('phoneno');
    if (retrievedItem4 !== null)
    {this.setState({phoneno:retrievedItem4})}

    const retrievedItem5 = await AsyncStorage.getItem('img');
    if (retrievedItem5 !== 'data:;base64,')
    {this.setState({img:retrievedItem5})}

    const retrievedItem6 = await AsyncStorage.getItem('bio');
    if (retrievedItem6 !== '')
    {this.setState({bio:retrievedItem6})}

    } 

    catch (error) {
      console.log(error);
    }
  }
  
  goback = async (navigation) => {
    navigation.goBack();
  };

  validateFullname = fullname => {
    var re = /^[a-zA-Z' ]{2,25}$/;
    return re.test(fullname);
  };

  validatePhoneNo = phoneno => {
    var re = /^[\+]?\d{10,15}$/;
    return re.test(phoneno);
  };

  validateBio = bio => {
    var re = /^[a-zA-Z0-9'!.,'*;"-+=_? ]{2,90}$/;
    return re.test(bio);
  };

  validation() {
    
    var error = ''
    var a = ''
    var b = ''
    var c = ''
    
    var check = ''

    if (!this.validateFullname(this.state.fullname)) {
      var fn = 'Invalid Display Name.'
      var a = error.concat(fn) }
    else 
      { this.setState({fullnameValidationDone:true}) }
    
    if (!this.validateBio(this.state.bio)) {
      var bio = ' Invalid Bio format.'
      var b = error.concat(bio) }
    else 
      { this.setState({bioValidationDone:true}) }

    if (!this.validatePhoneNo(this.state.phoneno)) {
      var ph = ' Invalid Phone Number.'
      var c = error.concat(ph) }
    else 
      { this.setState({fullnameValidationDone:true}) }

    if ((this.state.phonenoValidationDone == true) && (this.state.fullnameValidationDone == true)
         && this.state.bioValidationDone == true)
    { this.modifyDetails() }
  
    else {
      if(check.concat(a,b,c) != '') 
      { alert(check.concat(a,b,c))}
      
      else 
      { this.modifyDetails()}
    }
  }

  storeLocally = async() => {
    try {
      await AsyncStorage.setItem('fullname', this.state.fullname)
      await AsyncStorage.setItem('bio', this.state.bio)
      await AsyncStorage.setItem('phoneno', this.state.phoneno)
      await AsyncStorage.setItem('img', `data:${this.state.mime};base64,${this.state.base64string}`)
    } 
    catch(error) {
      console.log(error)
    }
  }

  storeData = async() => {
    try {
      await AsyncStorage.setItem('fullname', this.state.fullname)
      await AsyncStorage.setItem('bio', this.state.bio)
      await AsyncStorage.setItem('phoneno', this.state.phoneno)
    } 
    catch(error) {
      console.log(error)
    }
  }

  modifyDetails = async() => {

    if (this.state.mime !== '' && this.state.base64string !== '') {

    const params =  { username: this.state.i, fullname: this.state.fullname, 
                      bio: this.state.bio, phoneno: this.state.phoneno, 
                      picture: `data:${this.state.mime};base64,${this.state.base64string}` };
    const response = await Parse.Cloud.run("Profile", params);

    if (response['success'] == true){

      this.storeLocally()
      this.props.route.params.fetchDP(`data:${this.state.mime};base64,${this.state.base64string}`)
      this.props.route.params.fetchFullname(this.state.fullname)
      this.props.route.params.fetchBio(this.state.bio)
      this.goback(this.props.navigation)

    }
    else if (response['success'] == false){
      alert("An error occured. Please try again later.")
    } }

    else if (this.state.mime == '' && this.state.base64string == '' &&
             this.state.img !== `data:;base64,`) {

      const params =  { username: this.state.i, fullname: this.state.fullname, 
                        bio: this.state.bio, phoneno: this.state.phoneno, 
                        };
      const response = await Parse.Cloud.run("ProfileNew", params);

      if (response['success'] == true) {

        this.storeData()
        this.props.route.params.fetchDP(this.state.img)
        this.props.route.params.fetchFullname(this.state.fullname)
        this.props.route.params.fetchBio(this.state.bio)
        this.goback(this.props.navigation)

      }
      else if (response['success'] == false) {
        alert("An error occured. Please try again later.")
      } 
    }
      
    else if (this.state.img == `data:;base64,`) {

      const params =  { username: this.state.i, fullname: this.state.fullname, 
                        bio: this.state.bio, phoneno: this.state.phoneno, 
                        picture: `data:${this.state.mime};base64,${this.state.base64string}` };
      const response = await Parse.Cloud.run("Profile", params);
  
      if (response['success'] == true) {
        
        this.storeLocally()
        this.props.route.params.fetchDP(`data:${this.state.mime};base64,${this.state.base64string}`)
        this.props.route.params.fetchFullname(this.state.fullname)
        this.props.route.params.fetchBio(this.state.bio)
        this.goback(this.props.navigation)
        
      }
      else if (response['success'] == false) {
        alert("An error occured. Please try again later.")
      } 
    }

  }

  displayPicture() {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      includeBase64: true,
      cropping: true,
      //mediaType:true,
      compressImageQuality:0.6
    }).then(image => {
      //console.log(image);
      const source = {uri: image.path}
      let picture = {
        url:source, 
        content:image.data
      }
      this.setState({
        base64string: image.data, 
        mime: image.mime, 
        picture: picture, 
        imageClicked: true
      });
    }
    );
  }

  actionSheet1() {
    this.ActionSheet1.show()
  }

  actionSheet2() {
    this.ActionSheet2.show()
  }

  chooseDisplayPicture() {
    return (
      <View style={styles2.dpaction}>
        <TouchableOpacity onPress={() => this.actionSheet2()}>
          
          {this.state.img !== 'data:;base64,' ? 
            <View style={styles2.imageview}>
              <Image source = {{uri: this.state.img}}
                     style={styles2.dp}/>
            </View>
          :
            <Image source = {require('../../assets/images/Profile/noPic.png')} 
                   style={styles2.choosedpback} />
          }
         
        </TouchableOpacity>
      </View>
    )
  }

  deleteDisplayPicture() {

    return (
      
        <View style={styles2.dpaction}>
          <TouchableOpacity onPress={()=> this.actionSheet2()}>

            { this.state.picture.url != 'data:;base64,' ?
              <Image source = {this.state.picture.url}
                     style={styles2.deletedp}/>  :
              <Image source = {require('../../assets/images/Profile/noPic.png')} 
                     style={styles2.dpback} />
             }      

          </TouchableOpacity>
        </View>
  
    )
  }

  fetchProfileDetails = async() => {

    const retrievedItem2 = await AsyncStorage.getItem('objectId');
    
    {this.setState({objectId:retrievedItem2})}

    const params =  { username: this.state.i };
    const response = await Parse.Cloud.run("ProfileDetails", params);
    
    if(response['success'] == true) {
      
      var a = response['data'][0]
      if (a !== null)
        {this.setState({fullname:a})}

      var b = response['data'][1]
      if (b !== null)
        {this.setState({bio:b})}
      
      var c = response['data'][2]
      if (c !== null)
        {this.setState({phoneno:c})}
      
      var d = response['data'][3]
      if (d !== null)
        {this.setState({img:d})}

    }
    else if (response['success'] == false) {
      alert("Invalid details.")
    }

  }

  componentDidMount() {
    
    this.retrieveItems() 
    this.fetchProfileDetails()
    
    const unsubscribe = NetInfo.addEventListener(state => {
      this.setState({online: state.isConnected});
    });

  }

  render() {
    
    const {navigation} = this.props
    connected = this.state.online

    return(

     <View style={styles2.container}> 
       <StatusBar barStyle="dark-content"/>
        
        <View style={styles2.topview}>

          <TouchableOpacity style={{
            backgroundColor:'red', 
            width:ScreenDimensions.windowWidth, 
            position:'absolute',
            justifyContent:'center',
            alignItems:'center',
            top:0,
            opacity: connected == false ? 1 : 0, 
            }}
            disabled={!connected}>
            <Text style={styles2.nointernet}>
              Waiting for network..
            </Text>
          </TouchableOpacity>

          <View style={styles2.one}>
          <TouchableOpacity onPress={() => this.goback(this.props.navigation)}> 
              <Image source = {require('../../assets/images/Profile/back_black.png')} 
              style={styles2.back}/>
            </TouchableOpacity>
          </View>
          
          <View style={styles2.two}>
    
            {this.state.imageClicked ? this.deleteDisplayPicture() : this.chooseDisplayPicture() }
          
            <View resizeMode='contain' style={styles2.three}>
              <TouchableOpacity resizeMode='contain'>
              <Text allowFontScaling={true} adjustsFontSizeToFit={true} 
                    style={styles2.text1}>
                    {this.state.i}</Text>
              </TouchableOpacity>
            </View>

            <View resizeMode='contain' style={styles2.four}>
              <TouchableOpacity resizeMode='contain'>
              <Text allowFontScaling={true} adjustsFontSizeToFit={true} 
                    style={styles2.text2}>
                    {this.state.fullname}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles2.five}>
              <TouchableOpacity onPress={() => this.actionSheet1()}>
                <Image source = {require('../../assets/images/Profile/camera.png')} style={styles2.camera}/>
              </TouchableOpacity>
            </View>

          </View>
        </View>
       
        <ScrollView style={styles2.bottomview}>
    
          <View style={styles2.input}>
            <View style={styles2.icon}>
              <Image source = {require('../../assets/images/Profile/name.png')} 
              style={styles2.iconstyle}/>
            </View>
            <View style={styles2.inputfield}>
              <TextInput style={styles2.inputtext} 
                placeholder='Display Name'
                placeholderTextColor='#8E8E8E' 
                value={this.state.fullname}
                onChangeText={text => this.setState({fullname:text})}/>
            </View>
          </View> 

          <View style={styles2.input}>
            <View style={styles2.icon}>
              <Image source = {require('../../assets/images/Profile/username.png')} style={styles2.iconstyle}/>
            </View>
            <View style={styles2.inputfield}>
              <TouchableOpacity style={styles2.inputtext}>
                <Text style={styles2.fixedtext}>{this.state.i}</Text>
              </TouchableOpacity>
            </View>
          </View> 

          <View style={styles2.bioinput}>
            <View style={styles2.bioinputfield}>
              <Image source = {require('../../assets/images/Profile/bio.png')} style={styles2.iconstyle}/>
            </View>
            <View style={styles2.biotext}>
              <TextInput style={styles2.bioinputtext} 
                placeholder='Bio'
                placeholderTextColor='#8E8E8E' 
                value={this.state.bio}
                multiline={true}
                onChangeText={text => this.setState({bio:text})}/>
            </View>
          </View> 

          <View style={styles2.input}>
            <View style={styles2.icon}>
              <Image source = {require('../../assets/images/Profile/email.png')} style={styles2.iconstyle}/>
            </View>
            <View style={styles2.inputfield}>
              <TouchableOpacity style={styles2.inputtext}>
                <Text style={styles2.fixedtext}>{this.state.j}</Text>
              </TouchableOpacity>
            </View>
          </View> 

          <View style={styles2.input}>
            <View style={styles2.icon}>
              <Image source = {require('../../assets/images/Profile/email.png')} style={styles2.iconstyle}/>
            </View>
            <View style={styles2.inputfield}>
              <TextInput style={styles2.inputtext} 
                placeholder='Phone no.'
                placeholderTextColor='#8E8E8E' 
                value={this.state.phoneno}
                onChangeText={text => this.setState({phoneno:text})}/>
            </View>
          </View> 

          <TouchableOpacity onPress={() => this.validation()} 
            disabled={!connected}
            style={{marginRight:19,
                    marginTop:19,
                    marginLeft:19,
                    marginBottom:20,
                    flexDirection:'row',
                    justifyContent:'flex-end', 
                    flex:1,
                    opacity: connected ? 1 : 0.5}}>
            <LinearGradient style={styles2.lineartext} start={{x:0,y:0}} end={{x:1,y:1}} colors={['#350078','#00FFFF']}>
              <View style={styles2.saveicon}><Image source = {require('../../assets/images/Profile/save.png')} style={styles2.saveiconstyle}/></View> 
              <Text style={styles2.buttontext}>Save</Text>
            </LinearGradient>
          </TouchableOpacity>
        
          <ActionSheet
            ref={a => this.ActionSheet1 = a}
            title={'Choose from below'}
            options={['Select from Library', 'Cancel']}
            cancelButtonIndex={1}
            destructiveButtonIndex={1}
            onPress={(value) => {
              switch(value) {
                case 0:
                  this.displayPicture()
                  break
                case 1:
                  break
                default:
                  break
              }
            }}
          />

          <ActionSheet
            ref={a => this.ActionSheet2 = a}
            title={'Choose from below'}
            options={['Keep Image', 'Delete Image']}
            cancelButtonIndex={1}
            destructiveButtonIndex={1}
            onPress={(value) => {
              switch (value) {
                case 0: 
                  break
                case 1: 
                  this.setState({base64string:'', picture:{}})
                  this.setState({imageClicked:false})
                  this.setState({img:`data:;base64,`})
                  break
                default: 
                  break
              }
            }
          }
          />
        </ScrollView>

      </View>
    )
  }
}

export default function() {
  const navigation = useNavigation()
  const route = useRoute()  
  return <Profile navigation={navigation} route={route} />
}