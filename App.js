import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground } from 'react-native';
import { Camera, Permissions } from 'expo';

export default class App extends React.Component {
  state = {
    cameraPermission: null
  }

  componentDidMount() {
    Permissions.askAsync(Permissions.CAMERA)
      .then(({ status }) =>
        this.setState({
          cameraPermission: status === 'granted'
        })
      );
  }

  render() {
    const { cameraPermission } = this.state;
    return (
      <View style={styles.container}>
        {cameraPermission === null ? (
          <Text>Waiting for permission...</Text>
        ) : cameraPermission === false ? (
          <Text>Permission denied</Text>
        ) : (
          <Autoshoot />
        )}
      </View>
    );
  }
}

const PHOTO_INTERVAL = 30000;
const FOCUS_TIME = 3000;
// might need to grab IP and swap for localhost:
const SERVER_URL = 'http://10.1.7.90:5005/'

class Autoshoot extends React.Component {
  state = {
    photo: null
  }

  componentDidMount() {
    this.countdown = setTimeout(
      this.takePicture,
      PHOTO_INTERVAL
    );
  }

  componentWillUnmount() {
    clearInterval(this.countdown);
  }

  queuePhoto = () => {
    // In 27 seconds turn the camera back on
    setTimeout(() => {
      this.setState({ photo: null});
    }, PHOTO_INTERVAL - FOCUS_TIME);

    // In 30 seconds take the next picture
    setTimeout(this.takePicture, PHOTO_INTERVAL);
  }

  takePicture = () => {
    this.camera.takePictureAsync({
      quality: 0.1,
      base64: true,
      exif: false
    }).then(photo => {
      this.setState({ photo }, () => {
        this.uploadPicture()
          .then(this.queuePhoto)
          .catch(this.queuePhoto);
      });
    });
  }

  returnCamera = () => {
    this.setState({
      photo: null
    })
  }

  uploadPicture = () => {
    return fetch(SERVER_URL, {
      body: JSON.stringify({
        image: this.state.photo.base64
      }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    })
    .then(res => res.json())
  }

  render() {
    const { photo } = this.state;
    return (
      <View style={{flex: 1, width: '100%'}}>
        {photo ? (
          <ImageBackground
            style={{ flex:1 }}
            source={{ uri: photo.uri }}
            onPress={this.returnCamera}>
            <TouchableOpacity
              style={{ flex: 1}}
              onPress={this.returnCamera}
              />
          </ImageBackground>
        ) : (
          <Camera
            style= {{ flex: 1 }}
            onPress={this.takePicture}
            type={Camera.Constants.Type.back}
            ref={cam => this.camera = cam}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={this.takePicture}/>
          </Camera>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
