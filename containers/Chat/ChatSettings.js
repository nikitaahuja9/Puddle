import React, { Component } from 'react';

import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert
} from 'react-native';

import AdminSettings from './AdminSettings';
import NotificationSettings from '../../views/Chat/NotificationSettings';
import SubscribersList from './SubscribersList';
import StoredMedia from '../../views/PuddleScreen/Chat/StoredMedia';

import NetInfo from "@react-native-community/netinfo";
import SInfo from 'react-native-sensitive-info';
import ActionSheet from 'react-native-actionsheet';

import styles from '../../styles/Chat/ChatSettings/styles';
import Data from '../../util/Data';

var connected = Data.TRUE

export default class ChatSettings extends Component {

  constructor() {
    super()
    this.state = {
      groupId: '',
      settingsoption: 7,
      myadminvalue: false,
      online:true
    }
  }

  //clear chat function added by harshit gajjar
  clearMyChat() {
    SInfo.setItem(this.props.groupIdValue, JSON.stringify([]), {});
  }

  checkNewAdmin = async () => {

    const params = { groupIdVal: this.props.groupIdValue };
    const response = await Parse.Cloud.run("FetchMemberList", params);

    var array = []
    var a = ''
    for (i = 0; i < response['data'].length; i++) {
      a = response['data'][i]['userobject']
      array.push(a)
    }

    if (array.length > 2) {

      h = []
      for (i = 0; i < array.length; i++) {
        if (this.props.userIdValue !== array[i]) {
          const params = { userId: array[i] };
          const response = await Parse.Cloud.run("CheckUserAdmin", params);
          h.push(response['data'])
        }
      }

      z = false
      for (i = 0; i < h.length; i++) {
        if (h[i] == true) {
          z = true
        }
      }

      if (z == true) {
        console.log("Reassignment not needed")
      }
      else {
        console.log("Reassignment needed")

        var obj = new Object()
        var mainarray = []
        var p = []

        for (i = 0; i < array.length; i++) {
          if (array[i] !== this.props.userIdValue) {
            p.push(array[i])
          }
        }

        for (j = 0; j < p.length; j++) {
          var Puddle = Parse.Object.extend('Messages')
          var query = new Parse.Query(Puddle)
          query.equalTo('groupId', this.props.groupIdValue)
          query.equalTo('senderId', p[j])
          var results = await query.find()

          const n = ''
          counter = 0

          for (k = 0; k < results.length; k++) {
            thisObject = results[k]
            n = thisObject.get('Message') + " " + thisObject.get('senderId')
            if (n) {
              counter += 1
            }
          }
          //console.log((counter) + " is the count for " + p[j])
          obj.sender = p[j]
          obj.counter = counter
          mainarray.push({ sender: obj.sender, counter: obj.counter })
        }
      }

      d = []
      for (i = 0; i < mainarray.length; i++) {
        var u = mainarray[i]['counter']
        d.push(u)
      }

      var max = 0
      max = Math.max.apply(0, d)

      var e = ''
      for (i = 0; i < mainarray.length; i++) {
        if (max == mainarray[i]['counter']) {
          e = mainarray[i]["sender"]
        }
      }

      const params = {
        userobject: e,
        groupIdVal: this.props.groupIdValue
      };
      const mainresult = await Parse.Cloud.run("AssignUserAdmin", params);

      if (mainresult['success'] == true) {
        console.log("New admin assigned")
      }

    }

    else if (array.length == 2) {

      d = ""
      for (i = 0; i < array.length; i++) {
        if (this.props.userIdValue !== array[i]) {
          d = array[i]
        }
      }

      const params = {
        userobject: d,
        groupIdVal: this.props.groupIdValue
      };
      const response2 = await Parse.Cloud.run("AssignUserAdmin", params);

      if (response2['success'] == true) {
        console.log("One user exists and has been assigned admin")
      }

    }

    else if (array.length == 1) {

      console.log("No admin assignment needed")
      console.log("Puddle can be deleted")

      const params = { groupId: this.props.groupIdValue };
      await Parse.Cloud.run("DeletePuddle", params);

    }
  }

  performRemoveAction = async () => {

    params = { gid: this.props.groupIdValue }
    const result = await Parse.Cloud.run('decreaseCount', params)

    params = {
      groupId: this.props.groupIdValue,
      userId: this.props.userIdValue
    }

    const response = await Parse.Cloud.run('ExitPuddle', params)

    if ((response["success"] == true) && (result["success"] == true)) {
      alert('Successfully Exited Puddle')
      this.clearMyChat()
      // SInfo.setItem(this.state.groupId, JSON.stringify([]), {});
      this.props.closePanel()
      this.props.navigation.goBack()
    }
    else {
      alert("Error")
    }

  }


  // exit puddle function added by harshit gajjar
  async exitPuddle() {

    this.checkNewAdmin()
    this.performRemoveAction()

  }

  //report puddle added by harshit gajjar
  async reportPuddle() {
    params = {
      gid: this.state.groupId
    }
    const resp = await Parse.Cloud.run('ReportPuddle', params)
    if (resp["success"]) {
      alert('Report Sent')
    }
  }

  chooseSettings(index) {
    switch (index) {
      case 0:
        return this.adminSettings()
      case 1:
        return this.viewSubscribersList()
      case 2:
        return this.viewStoredMedia()
      case 3:
        return this.notificationPreferences()
      case 4:
        return this.clearChat()
      case 5:
        return this.leavePuddle()
      case 6:
        return this.report()
      default:
        return this.puddleSettings()
    }
  }

  async componentDidMount() {
    const params = {
      groupIdVal: this.props.groupIdValue,
      userIdVal: this.props.userIdValue
    };
    const response = await Parse.Cloud.run("AmIAnAdmin", params);

    if (response['data'] == true) {
      this.setState({ myadminvalue: true })
    }

    let query0 = new Parse.Query('User');
    query0.equalTo('groupId', this.props.groupIDValue)
    let sub0 = await query0.subscribe();

    // sub0.on('open', () => {
    //   console.log('Subscription Opened for User');
    // });

    let query1 = new Parse.Query('UserGroup');
    query1.equalTo('groupId', this.props.groupIDValue)
    let sub1 = await query1.subscribe();

    // sub1.on('open', () => {
    //   console.log('Subscription Opened for User');
    // });

    let query2 = new Parse.Query('Puddle');
    query2.equalTo('groupId', this.props.groupIDValue)
    let sub2 = await query2.subscribe();

    // sub2.on('open', () => {
    //   console.log('Subscription Opened for Puddle');
    // });

    const unsubscribe = NetInfo.addEventListener(state => {
      this.setState({online: state.isConnected});
    });
  }

  adminSettings() {
    return (
      <View style={styles.container}>
        {this.state.myadminvalue == true ?
          <AdminSettings
            userIdVal={this.props.userIdValue}
            groupIdVal={this.props.groupIdValue}
            closePanelNow={this.props.closePanel}
            changeSetting={this.changeSettingsOption}
            navigation={this.props.navigation} />
          :
          (
            Alert.alert(
              "Authorization Required",
              "You are not an admin",
              [
                {
                  text: "Cancel",
                  onPress: () => this.props.closePanel()
                },
                { text: "Okay", onPress: () => this.props.closePanel() }
              ],
              { cancelable: false }
            ))
        }
      </View>
    )
  }

  changeSettingsOption = value => {
    this.setState({ settingsoption: value })
  }

  viewSubscribersList() {
    return (
      <SubscribersList
        userIdVal={this.props.userIdValue}
        groupIdVal={this.props.groupIdValue}
        closePanelNow={this.props.closePanel}
        changeSetting={this.changeSettingsOption} />
    )
  }

  // modified by harshit gajjar....
  viewStoredMedia() {
    return <StoredMedia
      arr={this.props.myMedia}
      gid={this.props.groupIdValue}
      closePanelNow={this.props.closePanel}
      backbtbn={this.changeSettingsOption}
    />
  }

  notificationPreferences() {
    return (
      <NotificationSettings
        userIdVal={this.props.userIdValue}
        groupIdVal={this.props.groupIdValue}
        closePanelNow={this.props.closePanel}
        changeSetting={this.changeSettingsOption} />
    )
  }

  clearChat() {
    Alert.alert(
      'Clear Chat',
      'Are you sure, you want to clear chat?',
      [
        { text: 'No', onPress: () => console.log('No Pressed') },
        {
          text: 'Yes', onPress: () => {
            this.clearMyChat()
            this.props.closePanel()
            this.props.navigation.goBack()
          }
        },
      ],
      { cancelable: false }
    )
    return this.puddleSettings()
  }

  leavePuddle() {
    Alert.alert(
      'Exit Puddle',
      'Are you sure, you want to leave the puddle ?',
      [
        { text: 'No', onPress: () => console.log('No Pressed') },
        { text: 'Yes', onPress: () => this.exitPuddle() },
      ],
      { cancelable: false }
    )
    return this.puddleSettings()
  }

  report() {
    this.ActionSheet.show()
    return this.puddleSettings()
  }

  puddleSettings() {
    return (
      <View style={styles.container}>

        <TouchableOpacity onPress={() => this.props.closePanel()}
          style={styles.remainder}>
        </TouchableOpacity>

        <View style={styles.main}>

          <View style={styles.heading}>
            <Text style={styles.headingtext}>Puddle Settings</Text>
          </View>

          <View style={styles.input}>
            <View style={styles.icon}>
              <Image source={require('../../assets/images/Chat/adminsettings.png')}
                style={styles.adminicon} />
            </View>
            <TouchableOpacity style={styles.option}
              onPress={() => this.setState({ settingsoption: 0 })}>
              <Text style={styles.settingstext}>Admin Settings</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.input}>
            <View style={styles.icon}>
              <Image source={require('../../assets/images/Chat/settings_members.png')} style={styles.iconstyle} />
            </View>
            <TouchableOpacity style={styles.settings}
              onPress={() => { this.setState({ settingsoption: 1 }) }}>
              <Text style={styles.settingstext}>View Subscribers List</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.input}>
            <View style={styles.icon}>
              <Image source={require('../../assets/images/Chat/settings_media.png')} style={styles.iconstyle} />
            </View>
            <TouchableOpacity style={styles.settings}
              onPress={() => { this.setState({ settingsoption: 2 }) }}>
              <Text style={styles.settingstext}>View Stored Media</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.input}>
            <View style={styles.icon}>
              <Image source={require('../../assets/images/Chat/settings_notifications.png')} style={styles.iconstyle} />
            </View>
            <TouchableOpacity style={styles.settings}
              onPress={() => 
                { connected == true ? 
                  this.setState({ settingsoption: 3 }) 
                :
                ( Alert.alert(
                  "No Internet Connection",
                  "Check your internet connection and try again",
                  [
                    { text: "Okay" }
                  ],
                  {cancelable:false}
                )) }}>
              <Text style={styles.settingstext}>Notification Preferences</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.input}>
            <View style={styles.icon}>
              <Image source={require('../../assets/images/Chat/settings_clear.png')} style={styles.iconstyle} />
            </View>
            <TouchableOpacity style={styles.settings}
              onPress={() => 
                { connected == true ? 
                  this.setState({ settingsoption: 4 }) 
                :
                ( Alert.alert(
                  "No Internet Connection",
                  "Check your internet connection and try again",
                  [
                    { text: "Okay" }
                  ],
                  {cancelable:false}
                )) }}>
              <Text style={styles.settingstext}>Clear Chat</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.input}>
            <View style={styles.icon}>
              <Image source={require('../../assets/images/Chat/settings_leave.png')} style={styles.iconstyle} />
            </View>
            <TouchableOpacity style={styles.settings}
              onPress={() => 
                { connected == true ? 
                  this.setState({ settingsoption: 5 }) 
                :
                ( Alert.alert(
                  "No Internet Connection",
                  "Check your internet connection and try again",
                  [
                    { text: "Okay" }
                  ],
                  {cancelable:false}
                )) }}>
              <Text style={styles.leavetext}>
                Leave Puddle</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.input}>
            <View style={styles.icon}>
              <Image source={require('../../assets/images/Chat/settings_report.png')} style={styles.iconstyle} />
            </View>
            <TouchableOpacity style={styles.settings}
              onPress={() => 
                { connected == true ? 
                  this.setState({ settingsoption: 6 }) 
                :
                ( Alert.alert(
                  "No Internet Connection",
                  "Check your internet connection and try again",
                  [
                    { text: "Okay" }
                  ],
                  {cancelable:false}
                )) }}>
              <Text style={styles.settingstext}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  render() {

    connected = this.state.online

    return (
      <View style={styles.container}>
        <StatusBar barStyle='light-content' />
        {this.chooseSettings(this.state.settingsoption)}
        <ActionSheet
          ref={o => this.ActionSheet = o}
          style={{ color: 'red' }}
          title={"Report this group? If you report and exit, the group's messages will also be deleted"}
          options={["Report and Exit", "Report", "Cancel"]}
          cancelButtonIndex={2}
          destructiveButtonIndex={2}
          onPress={(index) => {
            switch (index) {
              case 0:
                this.reportPuddle()
                this.exitPuddle()
                break

              case 1:
                this.reportPuddle()
                alert("Report Sent")
                this.props.navigation.goBack()
                break

              default:
                console.log("default")
                break
            }
          }}
        />
      </View>
    )
  }
}