'use strict';

import React from 'react';

import { View, ScrollView } from 'react-native';

import BasicScene from './BasicScene';
import REGLBasicScene from './REGLBasicScene';
import REGLBunnyScene from './REGLBunnyScene';

export default class MultiBasicScene extends React.Component {
  static meta = {
    description: 'Multiple Scenes within a ScrollView',
    backgroundColor: '#fff',
  };

  render() {
    const { style } = this.props;

    return (
      <ScrollView style={style}>
        <View style={{ width: 600, height: 1000 }}>
          <BasicScene
            style={{
              position: 'absolute',
              left: 40,
              top: 40,
              width: 190,
              height: 190,
            }}
          />
          <BasicScene
            style={{
              position: 'absolute',
              left: 40,
              top: 240,
              width: 190,
              height: 190,
            }}
            speed={2.2}
          />
          <REGLBasicScene
            style={{
              position: 'absolute',
              left: 40,
              top: 440,
              width: 190,
              height: 190,
            }}
          />
          <REGLBunnyScene
            style={{
              position: 'absolute',
              left: 40,
              top: 640,
              width: 190,
              height: 190,
            }}
          />
        </View>
      </ScrollView>
    );
  }
}
