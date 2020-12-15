import React, {Component} from 'react';

import { 
  Text, 
  View, 
  TouchableOpacity, 
  Image,
  TextInput,
  ScrollView,
  FlatList,
  Alert,
  Linking
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import ActionSheet from 'react-native-actionsheet';

import ImagePicker from 'react-native-image-crop-picker';
import RBSheet from 'react-native-raw-bottom-sheet';

import NetInfo from '@react-native-community/netinfo';

import styles from '../../styles/Chat/AdminSettings/styles';
import ScreenDimensions from '../../util/ScreenDimensions';
import Data from '../../util/Data';

import BlockMembers from './BlockMembers';
import Invitations from '../../views/PuddleScreen/Chat/Invitations';
import {myConverter} from '../../util/HelperFunctions';

var connected = Data.TRUE;
invitearr = [];   // added by harshit gajjar, for storing the invites in private puddle

export default class AdminSettings extends Component {

  constructor() {
    super()
    this.state={
      adminsettingsoption:5,
      puddlename:'',
      puddledescription:'',
      puddleimage:'',
      picture:{},
      base64string:"",
      mime:"",
      imageselected:false,
      memberlist:[],
      username:'',
      userobject:'',
      fullname:'',
      image:'',
      bio:'',
      facebook:'',
      instagram:'',
      twitter:'',
      commonpuddles:0,
      admin:false,
      settingsclicked:false,
      settingsOption:0,
      adminval:1,
      myadminvalue:false,
      searchClicked:false,
      member:"",
      memberlist2:[],
      blocked:false,
      reported:false, 
      myprofile:false,
      online:true,
      invites: []    // this is for invites, added by harshit gajjar
  }}

  openPanel = () => {
    this.RBSheet.open();
  }
  
  closePanel = () => {
    this.setState({settingsclicked:false})
    this.RBSheet.close();
  }


  // added by harshit gajjar
  acceptRequest = async(index, sid) =>{
    invitearr = this.state.invites.filter((_, i) => i !== index)
    this.setState({
        invites: invitearr
    })

    params={
        sid: sid
    }

    const resp = await Parse.Cloud.run('AcceptRequests', params)

    params={
        gid: this.props.groupIdVal,
        uid: sid,
        msg: 'Your request to join puddle ' + this.state.puddlename + ' has been accpeted'
    }
    var result = await Parse.Cloud.run('JoinGroup', params)
    var result2 = await Parse.Cloud.run('increaseCount', params)
    var result3 = await Parse.Cloud.run('NotificationMsg', params)

   }

// this is also passed as props to invites
declineRequest = async(index, sid) =>{
    invitearr = this.state.invites.filter((_, i) => i !== index)
    this.setState({
        invites: invitearr
    })

    params={
        sid: sid
    }

    const resp = await Parse.Cloud.run('AcceptRequests', params)

}


async fetchInvites(){
  params={
      gid: this.props.groupIdVal 
  }

  var arr = []
  var resp = await Parse.Cloud.run('ShowRequests', params)
  resp = myConverter(resp)
 
  
  for(var i=0; i< resp["data"].length; i++){
      params={
          uid: resp["data"][0]["senderId"]
      }
      var resp2 = await Parse.Cloud.run('ShowUserDetails', params)
      resp2 = myConverter(resp2)

      arr.push({
          name: resp2["data"]["name"],
          image: resp2["data"]["image"],
          username: resp2["data"]["username"],
          sid: resp["data"][0]["senderId"]
      })
  }

  invitearr = arr
  this.setState({
      invites: arr
  })
}

  invites = () => {
    return (
    <Invitations 
    arr={invitearr} 
    backbtbn={this.backButton} 
    declineRequest={this.declineRequest}
    acceptRequest={this.acceptRequest}
    />
    )
  }

  adminSettingsOption(index) {
    switch(index) {
      case 0:
        return this.editPuddleDetails()
      case 1: 
        return this.assignAdmin()
      case 2:
        return this.blockMembers()
      case 3:
        ( 
          Alert.alert(
            "Critical action",
            "Are you sure you want to delete this Puddle? (This cannot be reverted)",
            [
              {
                text: "Cancel", onPress: () => this.props.closePanelNow()
              },
              { text: "Okay", onPress: () => this.deletePuddle()}
            ],
            {cancelable:false}
          )) 
        break
      case 4: 
        return this.invites()
      default:
        return this.adminPanel()
    }
  }

  // added by harshit gajjar
  backButton = () =>{
    this.setState({adminsettingsoption:5})
  }

  deletePuddle = async() => {
    const params =  { groupId: this.props.groupIdVal };
    const response = await Parse.Cloud.run("DeletePuddle", params);

    if (response['success'] == true) {
      this.notifyUsers("The puddle " + this.state.puddlename + " has been deleted")
      this.props.closePanelNow()
      this.props.navigation.goBack()
    }
  }

  fetchPuddleDetails = async() => {
    
    const params =  { groupIdVal: this.props.groupIdVal };
    const response = await Parse.Cloud.run("FetchPuddleDetails", params);

    if (response['success'] == true) {
      this.setState({puddlename:response['data'][0], 
      puddledescription:response['data'][1],
      puddleimage:response['data'][2]}) 
    }
  
  }

  updatePuddleBanner = async() => {
    
    const params =  { groupIdVal: this.props.groupIdVal,
                      name: this.state.puddlename, 
                      description: this.state.puddledescription,
                      image: `data:${this.state.mime};base64,${this.state.base64string}`};
    const response = await Parse.Cloud.run("UpdatePuddleBanner", params);

    // added by harshit gajjar
    this.notifyUsers("The banner of the puddle " + this.state.puddlename + " has been modified")

  }

  updatePuddleDetails = async() => {
    
    var params =  { groupIdVal: this.props.groupIdVal,
                      name: this.state.puddlename, 
                      description: this.state.puddledescription};
    const response = await Parse.Cloud.run("UpdatePuddleDetails", params);

    // added by harshit gajjar
    this.notifyUsers("The details of the puddle " + this.state.puddlename + " has been modified")

  }

  // added by harshit gajjar
  notifyUsers = async(str) =>{
    params = {
      arr: this.state.memberlist,
      msg: str,
      gid: this.props.groupIdVal
    }

    const resp = await Parse.Cloud.run('NotifyAllUsers', params)
  }

  chooseUpdateAction = () => {

    if (this.state.mime !== '' && this.state.base64string !== '') {
      this.updatePuddleBanner()
    }
  
    else if (this.state.mime == '' && this.state.base64string == '' &&
             this.state.puddleimage !== ``) {
      this.updatePuddleDetails()
    }
    else if (this.state.puddleimage !== ``) {
      this.updatePuddleBanner()
    }

  }

  actionSheet() {
    this.ActionSheet.show()
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
      const source = {uri: image.path}
      let picture = {
        url:source, 
        content:image.data
      }
      this.setState({
        base64string: image.data, 
        mime: image.mime, 
        picture: picture,
        imageselected:true
      });
    }
    );
  }

  newBanner() {
    return (
      <TouchableOpacity style={styles.banner}
        onPress={() => this.actionSheet()}>
        { this.state.picture.url == '' ? <Image style={styles.bgimage}/> :
        <Image source = {this.state.picture.url} style={styles.picture}/> }
        <View style={styles.newbanner}>
        <Text style={styles.bannertext}>Update Banner</Text>
        </View>
      </TouchableOpacity> 
    )
  }

  currentBanner() {
    return (
      <TouchableOpacity style={styles.banner}
        onPress = {() => this.actionSheet()}>
        <Image source = {{uri:this.state.puddleimage}} style={styles.picture}/>
        <View style={styles.newbanner}>
        <Text style={styles.bannertext}>Update Banner</Text>
        </View>
      </TouchableOpacity> 
    )
  }

  editPuddleDetails() {
    return (
      <View style={styles.editview}>
        
        <View behavior="padding" style={styles.main}>
          
            <View style={styles.heading}>
              <TouchableOpacity onPress={() => this.setState({adminsettingsoption:5})}
                style={styles.headingtextview}>
                  <Image source = {require('../../assets/images/Chat/back_black.png')} 
                         style={styles.goback}/>
              </TouchableOpacity>

              <Text style={styles.headingtext}>Edit Puddle Details</Text>
            </View>  
          
            <View style={styles.input2}>
              <View style={styles.icon}>
                <Image source = {require('../../assets/images/Chat/puddlename.png')} style={styles.iconstyle2}/>
              </View>
              <View style={styles.inputfield}>
                <TextInput style={styles.inputtext2} 
                  placeholder='Enter Puddle Name'
                  placeholderTextColor='#8E8E8E' 
                  value={this.state.puddlename}
                  onChangeText={text => this.setState({puddlename:text})}/>
              </View>
            </View> 

            <View style={styles.bioview}>
              <View style={styles.bioimageview}>
                <Image source = {require('../../assets/images/Chat/bio.png')} style={styles.iconstyle}/>
              </View>
              
              <View style={styles.bioinputfield}>
                <TextInput style={styles.biotext} 
                  placeholder='Enter Puddle Description'
                  placeholderTextColor='#8E8E8E' 
                  multiline={true}
                  value={this.state.puddledescription}
                  onChangeText={text => this.setState({puddledescription:text})}/>
              </View>
            </View> 

            {this.state.imageselected ? this.newBanner() : this.currentBanner()}
            
            <TouchableOpacity style={styles.savebuttoncontainer} 
                onPress={() => {this.chooseUpdateAction()
                              this.props.closePanelNow()}}
                disabled={!connected}>
              <LinearGradient style={{width:150,
                                      height:40, 
                                      borderRadius:40,
                                      marginTop:30,
                                      marginBottom:20,
                                      marginRight:19,
                                      justifyContent:'center',
                                      flexDirection:'row',
                                      opacity: connected == true ? 1 : 0.5}} 
                                      start={{x:0,y:0}} end={{x:1,y:1}} colors={['#350078','#00FFFF']}>
                                                  
                <View style={styles.saveicon}><Image source = {require('../../assets/images/Chat/save.png')} style={styles.saveiconstyle}/></View> 
                <Text style={styles.buttontext}>Save</Text>
              
              </LinearGradient>
            </TouchableOpacity>

        </View>
     
      </View>
    )
  }
  
  fetchMemberList = async() => {
    
    const params =  { groupIdVal: this.props.groupIdVal };
    const response = await Parse.Cloud.run("FetchMemberList", params);

    this.setState({memberlist:response['data'],memberlist2:response['data']})
  }

  async componentDidMount() {

    this.setState({groupId:this.props.groupIdVal})
    this.fetchPuddleDetails()
    this.fetchMemberList()
    this.fetchInvites()
    
    const unsubscribe = NetInfo.addEventListener(state => {
      this.setState({online: state.isConnected});
    });
  }

  findCommonPuddles = async(item) => {
    
    const params =  { userId: item['userobject'],
                      userIdVal: this.props.userIdVal };
    const response = await Parse.Cloud.run("FindCommonPuddles", params);

    this.setState({commonpuddles:response['data']})

  }

  userAdmin = async(item) => {
    
    const params =  { userId: item['userobject'] };
    const response = await Parse.Cloud.run("CheckUserAdmin", params);

    this.setState({admin:response['data']})

  }

  assignUserAdmin = async() => {
    
    const params =  { userobject: this.state.userobject,
                      groupIdVal: this.props.groupIdVal };
    const response = await Parse.Cloud.run("AssignUserAdmin", params);

    if (response['success'] == true) {
      this.fetchNewData() 
      this.closePanel()

      // added by harshit gajjar
      params={
        gid: this.props.groupIdVal,
        uid: this.props.userIdVal,
        msg: 'You have been assigned as admin for the puddle: ' + this.state.puddlename
      }

      const result = await Parse.Cloud.run('NotificationMsg',params)
    }
    
  }

  fetchNewData = async() => {

    const params =  { groupIdVal: this.props.groupIdVal };
    const response = await Parse.Cloud.run("FetchMemberList", params);

    this.setState({
      memberlist:response['data'],
      memberlist2:response['data']
    })

  }

  numberofAdmins = async() => {

    const params =  { groupIdVal: this.props.groupIdVal };
    const response = await Parse.Cloud.run("NumberofAdmins", params);

    if (response['success'] == true) {
      if (response['data'] >= 1) {
        this.setState({adminval:response['data']})
      }
    }
  
  }

  removeAdmin = async() => {

    const params =  { groupIdVal: this.props.groupIdVal,
                      userobject: this.state.userobject };
    const response = await Parse.Cloud.run("RemoveAdmin", params);

    if (response['success'] == true) {
      this.setState({myadminvalue:false}) 
      this.closePanel()
      this.fetchNewData()

      // added by harshit gajjar
      params={
        gid: this.props.groupIdVal,
        uid: this.props.userIdVal,
        msg: 'You have been removed as admin for the puddle: ' + this.state.puddlename
      }

      const result = await Parse.Cloud.run('NotificationMsg',params)
    }
   
  }

  amIAnAdmin = async() => {

    const params =  { groupIdVal: this.props.groupIdVal,
                      userIdVal: this.props.userIdVal };
    const response = await Parse.Cloud.run("AmIAnAdmin", params);

    if (response['data'] == true) {
      this.setState({myadminvalue:true})
    }
   
  }

  action = async(item) => {

    this.setState({
      username:item['username'], 
      image:item['image'], 
      fullname:item['fullname'], 
      userobject:item['userobject'],
      admin:item['admin'], 
      blocked:item['blocked'],
      bio:item['bio'],
      facebook:item['facebook'],
      instagram:item['instagram'],
      twitter:item['twitter'],
      searchClicked:false})

    this.findCommonPuddles(item)
    this.userAdmin(item)

    { this.props.userIdVal == item['userobject'] ?
      this.setState({myprofile:true})  
      :
      this.setState({myprofile:false})
    }

    this.openPanel()
    this.numberofAdmins()
    this.amIAnAdmin()
  }

  searchList(value){

    const data = this.state.memberlist2.filter(item => {
    const search = item["fullname"].toUpperCase()
    const text =  value.toUpperCase()
    return search.indexOf(text) > -1
    })

    this.setState({
      memberlist: data
    })

  }

  blockMember = async() => {

    const params =  { groupId: this.props.groupIdVal,
                      userId: this.state.userobject };
    const response = await Parse.Cloud.run("BlockMember", params);

    if (response['success'] == true) {
      this.fetchNewData()
      this.closePanel()

      // added by harshit gajjar
      params={
        gid: this.props.groupIdVal,
        uid: this.props.userIdVal,
        msg: 'You have been blocked for the puddle: ' + this.state.puddlename + " by the admins"
      }

      const result = await Parse.Cloud.run('NotificationMsg',params)
    }
     
  }

  blockAction = async() => {

    if (this.state.blocked !== true) {
      (Alert.alert(
        "Critical action",
        "Do you want to block this member?",
        [
          {
            text: "No", onPress: () => this.closePanel()
          },
          { text: "Yes", onPress: () => this.blockMember() }
        ],
        {cancelable:false}
      )) 
    }
    else if (this.state.blocked == true) {
      (Alert.alert(
        "Critical action",
        "This user is already blocked",
        [
          {
            text: "Okay", onPress: () => { this.fetchNewData()
                                           this.closePanel()}
          }
        ],
        {cancelable:false}
      )) 
    }
  }

  assignAdmin() {
    return(
      <View style={styles.assignadminview}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => this.setState({adminsettingsoption:5})}>
            <Image source = {require('../../assets/images/Chat/back_black.png')} 
              style={styles.back}/>
          </TouchableOpacity>
          
          { this.state.searchClicked ? 
          <TextInput 
          placeholder='Search'
          placeholderTextColor='#8E8E8E' 
          value={this.state.member}
          style={styles.search}
          onChangeText={text => {this.setState({member:text})
                                 this.searchList(text)}}/>
          :
          <Text style={styles.headertext}>
            Assign Admin
          </Text>
          }
          <TouchableOpacity style={styles.searchview}
            onPress={() => this.setState({searchClicked:true})}>
            <Image source = {require('../../assets/images/Chat/search.png')} 
                   style={styles.headericon}/>
          </TouchableOpacity>
        </View>
      
      { (this.state.memberlist.length > 0) ?
      <ScrollView style={styles.scrollview}>
        <FlatList 
          data={this.state.memberlist}
          renderItem={({item}) => 
            
            <TouchableOpacity style={styles.flatlist}
              onPress={() => this.action(item)}>
              <View style={styles.top}>

                { item['image'] !== 'data:;base64,' ? 
                  <Image source={{uri:item["image"]}}
                        style={styles.memberdp} />
                :
                <View style={styles.memberdp}>
                  <Image source={require('../../assets/images/Chat/noPic.png')}
                        style={styles.memberdpdefault}/> 
                </View> 
                }

                </View>

                <View style={styles.memberview}>
                  <TouchableOpacity style={styles.memberitem} onPress={() => 
                    { this.action(item) }}>
                    <Text style={styles.membername}>{item["fullname"]}</Text>
                    <Text style={styles.memberusername}>{item["username"]}</Text>
                  </TouchableOpacity>

                  <View style={styles.admincheck}>

                    {item["admin"] == false ?
                    <Image source={require('../../assets/images/Chat/settings_assign_blue.png')}
                    style={styles.membericon}/> 
                    :
                    <Image source={require('../../assets/images/Chat/check.png')}
                    style={styles.membericon}/> 
                    }
                  </View>
                </View>
              </TouchableOpacity>
            }
          />
        </ScrollView>
        :
          <View style={styles.nothing}>
            <Text style={styles.nothingtext}>
              Oops nothing here 
            </Text>
          </View>
        }
      </View>
    )
  }

  checkLink = (a) => {

    if ((a !== 'fb' && a !== 'ig' && a !== 'twttr') && a !== null) {
      this.openURL(a)
    }
    else {
      if (a == 'fb') {
        alert("This user has not updated the link to the Facebook profile")
      }
      else if (a == 'ig') {
        alert("This user has not updated the link to the Instagram profile")
      }
      else if (a == 'twttr') {
        alert("This user has not updated the link to the Twitter profile")
      }
      else if (a == null || a == '') {
        alert("This user has not updated the link to the social media account")
      }
      else {
        alert("Unable to open URL.")
      }
    }
  }

  openURL = (url) => {
    Linking.openURL(url)
  }

  actionSheet2() {
    this.ActionSheet2.show()
  }

  checkReports = (i) => {
    if (i>20) {
      this.blockMember()
    }
  }

  reportUser = async() => {
    
    if (connected == true) {
      if (this.state.reported == false) {
        const params =  { groupId: this.props.groupIdVal,
                          userId: this.state.userobject };
        const response = await Parse.Cloud.run("ReportUser", params);

        if (response['success'] == true) {
          ( Alert.alert(
            "Critical action",
            "Report sent",
            [
              { text: "Okay", onPress: () => {this.checkReports(response['data'])
                                            this.setState({reported:true})
                                            this.closePanel()}}
            ],
            {cancelable:false}
          )) 
        }
      }
      else {
        ( Alert.alert(
          "Critical action",
          "You have already reported this user",
          [
            { text: "Okay", onPress: () => this.closePanel()}
          ],
          {cancelable:false}
        )) 
      }
    }
    else {
      ( Alert.alert(
        "No Internet Connection",
        "Check your internet connection and try again",
        [
          { text: "Okay" }
        ],
        {cancelable:false}
      ))
    }
  }

  createProfileView() {
    return(
      <View style={styles.top}>
        
        <View style={styles.topview}>
          
          <View style={styles.one}>
            
            <TouchableOpacity onPress={() => this.closePanel()}
              style={styles.close}>
                <Image source = {require('../../assets/images/Chat/back_black.png')} 
                       style={styles.backbutton}/>
            </TouchableOpacity>

            {this.state.admin == true ? 
              <View style={styles.adminbutton}>
                <Text style={styles.admintext}>Admin</Text>
              </View> : null
            }

            { this.state.image !== 'data:;base64,' ? 
              <Image source={{uri:this.state.image}} style={styles.userdp}/> 
            :
              <View style={styles.memberdpview}>
                <Image source = {require('../../assets/images/Chat/noPic.png')} 
                       style={styles.memberdpdefault}/>
              </View>
            }

            <View style={styles.userdata}>
              <Text style={styles.fullname}>{this.state.fullname}</Text>
              <Text style={styles.username}>{this.state.username}</Text>
            </View>
            
            <TouchableOpacity style={styles.settingsbutton}
              onPress={() => {this.setState({settingsclicked:true}) 
                            panelheight=300}}>
              <Image source = {require('../../assets/images/Chat/puddle_settings_grey.png')} 
                     style={styles.settingsicon}/>
            </TouchableOpacity>
            
          </View> 

          <View style={styles.two}>
            <Image source = {require('../../assets/images/Chat/line.png')} 
                   style={styles.line1}/>
            <Text style={styles.info}>BIO</Text>
            { (this.state.bio !== null) ? 
            <Text style={styles.bioinfo}>{this.state.bio}</Text> 
            :
            <Text style={styles.bioinfo2}>This user has not updated the bio</Text>
            }                
          </View>

          <View style={styles.three}>
            <Image source = {require('../../assets/images/Chat/line.png')} 
                   style={styles.line1}/>
            
            <Text style={styles.commontext}>
            
              {this.state.commonpuddles == 0 ? 
                <Text style={styles.commoncolor}>Searching Common Puddles..</Text>
                :
                  this.state.commonpuddles > 1 ? 
                  <Text style={styles.commoncolor}>{this.state.commonpuddles} Puddles in Common</Text>
                  : 
                  <Text style={styles.commoncolor}>{this.state.commonpuddles} Puddle in Common</Text>}
            </Text>
          </View>

          <View style={styles.four}>
          <Image source = {require('../../assets/images/Chat/line.png')} 
                 style={styles.line1}/>
            <Text style={styles.socialtext}>SOCIAL MEDIA</Text>

            <View style={styles.socialicons}>
              <TouchableOpacity onPress={() => this.checkLink(this.state.facebook)}>
                <Image source = {require('../../assets/images/Chat/add_fb.png')} 
                       style={styles.socialimage}/>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.checkLink(this.state.instagram)}>
                <Image source = {require('../../assets/images/Chat/add_ig.png')} 
                       style={styles.socialimage}/>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.checkLink(this.state.twitter)}>
                <Image source = {require('../../assets/images/Chat/add_twttr.png')} 
                       style={styles.socialimage}/>
               </TouchableOpacity>
            </View>             
          </View>  
        
        </View>

        {this.state.settingsclicked == true ? 
        this.state.admin == false ? 
        <View style={styles.bottomview}>
          <View style={styles.adminsettingsinput}>
            <View style={styles.icon}>
              <Image source = {require('../../assets/images/Chat/settings_assign_blue.png')} style={styles.iconstyle}/>
            </View>
            <TouchableOpacity style={styles.settings} 
              onPress={() => 
                { connected == true ? 
                  this.assignUserAdmin()
                :
                ( Alert.alert(
                  "No Internet Connection",
                  "Check your internet connection and try again",
                  [
                    { text: "Okay" }
                  ],
                  {cancelable:false}
                )) }}>
              <Text style={styles.settingstext}>Assign Admin</Text>
            </TouchableOpacity>
          </View> 

          <View style={styles.adminsettingsinput}>
            <View style={styles.icon}>
              <Image source = {require('../../assets/images/Chat/settings_kick_red.png')} style={styles.iconstyle}/>
            </View>
            <TouchableOpacity style={styles.settings} 
              onPress={() => 
                { connected == true ? 
                  this.blockAction()
                :
                ( Alert.alert(
                  "No Internet Connection",
                  "Check your internet connection and try again",
                  [
                    { text: "Okay" }
                  ],
                  {cancelable:false}
                )) }}>
              <Text style={styles.settingstext}>Block Member</Text>
            </TouchableOpacity>
          </View> 

          <View style={styles.adminsettingsinput}>
            <View style={styles.icon}>
              <Image source = {require('../../assets/images/Chat/settings_report.png')} style={styles.iconstyle}/>
            </View>
            <TouchableOpacity style={styles.settings} 
              onPress={() => {this.setState({settingsclicked:false})
                              this.actionSheet2()}}>
              <Text style={styles.settingstext}>Report User</Text>
            </TouchableOpacity>
          </View> 
        </View>
      
        : 
        
        <View style={styles.bottomview}>
          <View style={styles.adminsettingsinput}>
            <View style={styles.icon}>
              <Image source = {require('../../assets/images/Chat/check.png')} style={styles.iconstyle}/>
            </View>
            { (this.state.userobject == this.props.userIdVal) ?
              <View style={styles.settings}>
                <Text style={styles.settingstext}>You are an admin</Text>
              </View>
              :
              <View style={styles.settings}>
                <Text style={styles.settingstext}>This user is an admin</Text>
              </View>
            }
          </View> 

          { (this.state.adminval > 1) ?
            (this.state.userobject !== this.props.userIdVal) ?
            <View style={styles.adminsettingsinput}>
              <View style={styles.icon}>
                <Image source = {require('../../assets/images/Chat/settings_kick_red.png')} style={styles.iconstyle}/>
              </View>
              <TouchableOpacity style={styles.settings} 
                onPress={() => 
                  { connected == true ? 
                    this.removeAdmin()
                  :
                  ( Alert.alert(
                    "No Internet Connection",
                    "Check your internet connection and try again",
                    [
                      { text: "Okay" }
                    ],
                    {cancelable:false}
                  )) }}>
                <Text style={styles.settingstext}>Remove admin</Text>
              </TouchableOpacity>
            </View> 
            : 
                null 
            : null
          }
        </View>
      : null} 
      </View>
    )
  }

  userProfileView() {
    return(
      <View style={styles.top}>
        
        <View style={styles.mytopview}>
          
          <View style={styles.one}>
            
            <TouchableOpacity onPress={() => this.closePanel()}
              style={styles.close}>
                <Image source = {require('../../assets/images/Chat/back_black.png')} 
                       style={styles.backbutton}/>
            </TouchableOpacity>

            {this.state.admin == true ? 
              <View style={styles.adminbutton}>
                <Text style={styles.admintext}>Admin</Text>
              </View> : null
            }

            { this.state.image !== 'data:;base64,' ? 
            <Image source={{uri:this.state.image}} style={styles.userdp}/> 
            :
            <View style={styles.userdp}>
              <Image source = {require('../../assets/images/Chat/noPic.png')} 
              style={styles.userdpdefault}/>
            </View>
            }

            <View style={styles.userdata}>
              <Text style={styles.fullname2}>{this.state.fullname}</Text>
              <Text style={styles.username2}>{this.state.username}</Text>
            </View>
            
          </View> 

          <View style={styles.twonew}>
            <Image source = {require('../../assets/images/Chat/line.png')} 
                   style={styles.line1}/>
            <Text style={styles.info}>BIO</Text>
            { (this.state.bio !== null) ? 
            <Text style={styles.bioinfo3}>{this.state.bio}</Text> 
            :
            <Text style={styles.bioinfo4}>This user has not updated the bio</Text>
            }          
          </View>

          <View style={styles.four}>
          <Image source = {require('../../assets/images/Chat/line.png')} 
                 style={styles.line1}/>
            <Text style={styles.socialtext}>SOCIAL MEDIA</Text>

            <View style={styles.socialicons}>
              <TouchableOpacity onPress={() => this.checkLink(this.state.facebook)}>
                <Image source = {require('../../assets/images/Chat/add_fb.png')} 
                       style={styles.socialimage}/>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.checkLink(this.state.instagram)}>
                <Image source = {require('../../assets/images/Chat/add_ig.png')} 
                       style={styles.socialimage}/>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.checkLink(this.state.twitter)}>
                <Image source = {require('../../assets/images/Chat/add_twttr.png')} 
                       style={styles.socialimage}/>
               </TouchableOpacity>
            </View>             
          </View>  
        
        </View>
      </View>
    )
  }

  changeSettingsOption = value => {
    this.setState({adminsettingsoption:value})
  }

  blockMembers() {
    return (
      <BlockMembers
      userIdVal={this.props.userIdVal}
      groupIdVal={this.props.groupIdVal} 
      closePanelNow={this.props.closePanelNow}
      changeSetting={this.changeSettingsOption}
      />
    )
  }

  adminPanel() {
    return (
      <View style={styles.adminpanel}>
        
        <TouchableOpacity onPress={() => this.props.closePanelNow()}
          style={styles.closeadminpanel}>
        </TouchableOpacity>

        <View style={styles.mainpanel}>
          <View style={styles.adminheader}>
            
            <TouchableOpacity onPress={() => this.props.changeSetting(7)}>
              <Image source = {require('../../assets/images/Chat/back_black.png')} 
                style={styles.back}/>
            </TouchableOpacity>
            <Text style={styles.adminheadertext}>Admin Settings</Text>
          </View>  

          <View style={styles.input}>
            <View style={styles.icon}>
              <Image source = {require('../../assets/images/Chat/settings_edit.png')} style={styles.iconstyle}/>
            </View>
            <TouchableOpacity style={styles.settings}
              onPress={() => 
                { connected == true ? 
                  this.setState({adminsettingsoption:0})
                :
                ( Alert.alert(
                  "No Internet Connection",
                  "Check your internet connection and try again",
                  [
                    { text: "Okay" }
                  ],
                  {cancelable:false}
                )) }}>
              <Text style={styles.settingstext}>Edit Puddle Details</Text>
            </TouchableOpacity>
          </View> 

          <View style={styles.input}>
            <View style={styles.icon}>
              <Image source = {require('../../assets/images/Chat/settings_assign.png')} style={styles.iconstyle}/>
            </View>
            <TouchableOpacity style={styles.settings}
              onPress={() => 
                { connected == true ? 
                  this.setState({adminsettingsoption:1})
                :
                ( Alert.alert(
                  "No Internet Connection",
                  "Check your internet connection and try again",
                  [
                    { text: "Okay" }
                  ],
                  {cancelable:false}
                )) }}>
              <Text style={styles.settingstext}>Assign Admin</Text>
            </TouchableOpacity>
          </View> 

          <View style={styles.input}>
            <View style={styles.icon}>
              <Image source = {require('../../assets/images/Chat/settings_assign.png')} style={styles.iconstyle}/>
            </View>
            <TouchableOpacity style={styles.settings}
              onPress={() => 
                { connected == true ? 
                  this.setState({adminsettingsoption:4})
                :
                ( Alert.alert(
                  "No Internet Connection",
                  "Check your internet connection and try again",
                  [
                    { text: "Okay" }
                  ],
                  {cancelable:false}
                )) }}>
              <Text style={styles.settingstext}>Join Requests</Text>
            </TouchableOpacity>
          </View> 

          <View style={styles.input}>
            <View style={styles.icon}>
              <Image source = {require('../../assets/images/Chat/settings_kick.png')} style={styles.iconstyle}/>
            </View>
            <TouchableOpacity style={styles.settings}
              onPress={() => 
                { connected == true ? 
                  this.setState({adminsettingsoption:2})
                :
                ( Alert.alert(
                  "No Internet Connection",
                  "Check your internet connection and try again",
                  [
                    { text: "Okay" }
                  ],
                  {cancelable:false}
                )) }}>
              <Text style={styles.settingstext}>Block Members</Text>
            </TouchableOpacity>
          </View> 

          <View style={styles.input}>
            <View style={styles.icon}>
              <Image source = {require('../../assets/images/Chat/settings_delete.png')} style={styles.iconstyle}/>
            </View>
            <TouchableOpacity style={styles.settings}
              onPress={() => 
                { connected == true ? 
                  this.setState({adminsettingsoption:3})
                :
                ( Alert.alert(
                  "No Internet Connection",
                  "Check your internet connection and try again",
                  [
                    { text: "Okay" }
                  ],
                  {cancelable:false}
                )) }}>
              <Text style={styles.deletetext}>
              Delete Puddle</Text>
            </TouchableOpacity>
          </View> 
        </View>       
      </View>
    )
  }

  render() {
    
    var bottom = 20
    var panelheight = ScreenDimensions.windowHeight * 0.87
    connected = this.state.online

    return(
      <View style={styles.container}> 
        {this.adminSettingsOption(this.state.adminsettingsoption)}
        
        <ActionSheet
          ref={a => this.ActionSheet = a}
          title={'Choose from below'}
          options={['Select New Banner', 'Keep Image']}
          cancelButtonIndex={1}
          destructiveButtonIndex={1}
          onPress={(value) => {
            switch (value) {
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
          title={'Pick an option'}
          options={['Report User', 'Cancel']}
          cancelButtonIndex={1}
          destructiveButtonIndex={1}
          onPress={(value) => {
            switch (value) {
              case 0:
                this.reportUser()
                break
              case 1: 
                break
              default: 
                break
            }
          }}
        />  

        <RBSheet
          ref={ref => {
            this.RBSheet = ref;
          }}
          height={panelheight}
          animationType="fade"
          duration={0}
          closeOnDragDown={false}
          closeOnPressBack={false}
          closeOnPressMask={false}
          customStyles={{
            container: {
              borderRadius:9,
              backgroundColor:'transparent', 
              right:25,
              left:22.7,
              width:ScreenDimensions.windowWidth*0.9,
              bottom:bottom
            }
          }}>
            { this.state.myprofile == true ? 
              this.userProfileView() 
              :
              this.createProfileView() }
        </RBSheet>

      </View>    
    )
  }
}