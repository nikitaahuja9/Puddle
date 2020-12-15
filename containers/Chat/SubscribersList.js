import React, {Component} from 'react';

import { 
  Text, 
  View, 
  TouchableOpacity, 
  Image,
  ScrollView,
  FlatList,
  TextInput,
  Linking
} from 'react-native';

import RBSheet from 'react-native-raw-bottom-sheet';
import Lightbox from 'react-native-lightbox';

import styles from '../../styles/Chat/SubscribersList/styles';
import ScreenDimensions from '../../util/ScreenDimensions';

export default class SubscribersList extends Component {
  constructor() {
    super()
    this.state={
      sublist:'',
      username:'',
      fullname:'',
      image:'',
      bio:'',
      commonpuddles:0,
      admin:false,
      settingsOption:0,
      searchbuttonClicked:false,
      member:"",
      sublist2:[],
      facebook:"",
      instagram:"",
      twitter:"",
      myprofile:false
  }}

  openPanel = () => {
    this.RBSheet.open();
  }
  
  closePanel = () => {
    this.setState({settingsclicked:false})
    this.RBSheet.close();
  }

  async componentDidMount() {

    this.setState({groupId:this.props.groupIdVal})
    
    const params =  { groupIdVal: this.props.groupIdVal };
    const response = await Parse.Cloud.run("FetchMemberList", params);

    this.setState({sublist:response['data'], sublist2:response['data']})

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

  action = async(item) => {

    this.setState({
      username:item['username'], 
      image:item['image'], 
      fullname:item['fullname'],
      userobject:item['userobject'],
      admin:item['admin'],
      bio:item['bio'],
      facebook:item['facebook'],
      instagram:item['instagram'],
      twitter:item['twitter'],
      searchbuttonClicked:false})

    this.findCommonPuddles(item)
    this.userAdmin(item)
    
    { this.props.userIdVal == item['userobject'] ?
      this.setState({myprofile:true})  
      :
      this.setState({myprofile:false})
    }

    this.openPanel()

  }

  searchList(value) {

    const data = this.state.sublist2.filter(item => {
    const search = item["fullname"].toUpperCase()
    const text =  value.toUpperCase()
    return search.indexOf(text) > -1
    })

    this.setState({
      sublist: data
    })

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

  createMemberObject() {
    return(
      <View style={styles.main}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => this.props.changeSetting(7) }>
            <Image source = {require('../../assets/images/Chat/back_black.png')} 
                   style={styles.headericon}/>
          </TouchableOpacity>
          
          { this.state.searchbuttonClicked ? 
          <TextInput 
          placeholder='Search'
          placeholderTextColor='#8E8E8E' 
          value={this.state.member}
          style={styles.search}
          onChangeText={text => {this.setState({member:text})
                                 this.searchList(text)}}/>
          :
          <Text style={styles.heading}>
            Subscribers List
          </Text>
          }
          <TouchableOpacity style={styles.searchview}
            onPress={() => this.setState({searchbuttonClicked:true})}>
            <Image source = {require('../../assets/images/Chat/search.png')} 
                   style={styles.headericon}/>
          </TouchableOpacity>
        </View>

      { this.state.sublist.length > 0 ? 
      <ScrollView style={styles.scrollview}>
        <FlatList 
          data={this.state.sublist}
          renderItem={({item}) => 
          
            <TouchableOpacity style={styles.list}
              onPress={() => this.action(item)}>
                <View style={styles.fill}>

                  { item['image'] !== 'data:;base64,' ?
                  <Image source={{uri:item["image"]}}
                    style={styles.dp} />
                  :
                  <View style={styles.memberdpview}>
                    <Image source={require('../../assets/images/Chat/noPic.png')}
                          style={styles.memberdpdefault}/> 
                  </View> 
                  }
                </View>

                <View style={styles.member}>
                  <TouchableOpacity style={styles.item} onPress={() => 
                    { this.action(item) }}>
                    <Text style={styles.fullname}>{item["fullname"]}</Text>
                    <Text style={styles.username}>{item["username"]}</Text>
                  </TouchableOpacity>

                  <View style={styles.membericonview}>
                    <Image source={require('../../assets/images/Chat/settings_members.png')}
                          style={styles.members}/>
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

            <TouchableOpacity>
              <Lightbox springConfig={{tension:100000, friction: 8000}} 
                        underlayColor="white"
                        renderContent={() => (
                
                <Image source={{uri:this.state.image}} style={styles.userdp}
                       style={{height:ScreenDimensions.windowHeight*0.5, 
                               width:ScreenDimensions.windowWidth}}/> )}>
                
                <Image source={{uri:this.state.image}} 
                       style={styles.userdp}/>    
              </Lightbox>
            </TouchableOpacity>
            :
            <View style={styles.userdp}>
              <Image source = {require('../../assets/images/Chat/noPic.png')} 
              style={styles.userdpdefault}/>
            </View>
            }

            <View style={styles.userdata}>
              <Text style={styles.memberfullname}>{this.state.fullname}</Text>
              <Text style={styles.memberusername}>{this.state.username}</Text>
            </View>
            
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
                  <Text style={styles.commoncolor}>{this.state.commonpuddles} Puddle in Common</Text>
              }
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
              
              <TouchableOpacity>
                <Lightbox springConfig={{tension:100000, friction: 8000}} 
                          underlayColor="white"
                          renderContent={() => (
                  <Image source={{uri:this.state.image}} 
                         style={{height:ScreenDimensions.windowHeight*0.5, 
                                 width:ScreenDimensions.windowWidth}}/> )}>
                  <Image source={{uri:this.state.image}} 
                         style={styles.userdp}/> 
                </Lightbox>
              </TouchableOpacity>
            :
            <View style={styles.userdp}>
              <Image source = {require('../../assets/images/Chat/noPic.png')} 
              style={styles.userdpdefault}/>
            </View>
            }

            <View style={styles.userdata}>
              <Text style={styles.memberfullname}>{this.state.fullname}</Text>
              <Text style={styles.memberusername}>{this.state.username}</Text>
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

  render() {

    var bottom = 10

    var panelheight = ScreenDimensions.windowHeight * 0.87
       
    return (
      <View style={styles.container}>
        {this.createMemberObject()}

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
              left:24,
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