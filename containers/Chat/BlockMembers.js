import React, {Component} from 'react';

import { 
  Text, 
  View, 
  TouchableOpacity, 
  Image,
  ScrollView,
  FlatList,
  TextInput,
  Alert
} from 'react-native';

import NetInfo from '@react-native-community/netinfo';

import styles from '../../styles/Chat/BlockMembers/styles';
import Data from '../../util/Data';

var connected = Data.TRUE;

export default class BlockMembers extends Component {
  constructor() {
    super()
    this.state={
      memberlist:'',
      username:'',
      fullname:'',
      image:'',
      admin:false,
      settingsOption:0,
      searchbuttonClicked:false,
      member:"",
      memberlist2:[],
      online:true
  }}

  async componentDidMount() {

    this.setState({groupId:this.props.groupIdVal})
    
    const params =  { groupIdVal: this.props.groupIdVal };
    const response = await Parse.Cloud.run("FetchBlockedMembersList", params);

    this.setState({
      memberlist:response['data'], 
      memberlist2:response['data']
    })

    const unsubscribe = NetInfo.addEventListener(state => {
      this.setState({online: state.isConnected});
    });

  }

  blockMember = async(item) => {

    const params =  { groupId: this.props.groupIdVal,
                      userId: item['userobject'] };
    const response = await Parse.Cloud.run("BlockMember", params);

    if (response['success'] == true) {
      (Alert.alert(
        "Critical action",
        "You have blocked this user",
        [
          { text: "Okay", onPress: () => this.props.closePanelNow()}
        ],
        {cancelable:false}
      )) 
    }
     
  }

  unblockMember = async(item) => {

    const params =  { groupId: this.props.groupIdVal,
                      userId: item['userobject'] };
    const response = await Parse.Cloud.run("UnblockMember", params);
    
    if (response['success'] == true) {
      (Alert.alert(
        "Critical action",
        "This user has been unblocked",
        [
          { text: "Okay", onPress: () => this.props.closePanelNow()}
        ],
        {cancelable:false}
      )) 
    }
  }

  action = async(item) => {

    if (connected == true) {
    if (this.props.userIdVal !== item['userobject']) {
      if (item['blocked'] !== true) {
        (Alert.alert(
          "Critical action",
          "Do you want to block this member?",
          [
            {
              text: "No"
            },
            { text: "Yes", onPress: () => this.blockMember(item)}
          ],
          {cancelable:false}
        )) 
      }
      else if (item['blocked'] == true) {
        (Alert.alert(
          "Critical action",
          "This member has been blocked. Do you want to unblock this member?",
          [
            {
              text: "No"
            },
            { text: "Yes", onPress: () => this.unblockMember(item)}
          ],
          {cancelable:false}
        )) 
      }
    }
    else {
      alert("You are a member of this puddle")
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

  createMemberObject() {

    return(
      <View style={styles.main}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => this.props.changeSetting(5) }>
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
            Members List
          </Text>
          }
          <TouchableOpacity style={styles.searchview}
            onPress={() => this.setState({searchbuttonClicked:true})}>
            <Image source = {require('../../assets/images/Chat/search.png')} 
                   style={styles.headericon}/>
          </TouchableOpacity>
        </View>

      { this.state.memberlist.length > 0 ? 
      <ScrollView style={styles.scrollview}>
        <FlatList 
          data={this.state.memberlist}
          renderItem={({item}) => 
            
            <TouchableOpacity 
            style={styles.list}
            onPress={() => 
              { this.setState({searchbuttonClicked:false})
                this.action(item)}}>
                <View style={styles.fill}>
                { item['image'] !== 'data:;base64,' ? 
                  <Image source={{uri:item['image']}} style={styles.userdp}/> 
                  :
                  <View style={styles.memberdpview}>
                    <Image source = {require('../../assets/images/Chat/noPic.png')} 
                           style={styles.memberdpdefault}/>
                  </View>
                }
                </View>

                <View style={styles.member}>
                  <TouchableOpacity style={styles.item} onPress={() => 
                    { this.setState({searchbuttonClicked:false})
                      this.action(item)}}>
                    <Text style={styles.fullname}>{item["fullname"]}</Text>
                    <Text style={styles.username}>{item["username"]}</Text>
                  </TouchableOpacity>
                  
                  { (item['blocked'] == true) ? 
                  <View style={styles.memberdisabled}>
                    <Image source={require('../../assets/images/Chat/settings_kick_red.png')}
                          style={styles.members}/>
                  </View>
                  :
                  <View style={styles.membericonview}>
                    <Image source={require('../../assets/images/Chat/settings_kick_red.png')}
                          style={styles.members}/>
                  </View>
                  }
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

  render() {  

    connected = this.state.online

    return (
      <View style={styles.container}>
        {this.createMemberObject()}
      </View>
      
    )
  }
}