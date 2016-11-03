'use strict';

import React from 'react';
import { PanResponder } from 'react-native';

import { createTHREEViewClass } from 'exponent';

const THREE = require('three');
const THREEView = createTHREEViewClass(THREE);


export default class BasicScene extends React.Component {
  static meta = {
    description: 'THREE Basic Touch Scene',
  };

  componentWillMount() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, 1, 1, 10000);
    this.camera.position.z = 1000;

    this.geometry = new THREE.BoxGeometry(200, 200, 200);
    this.material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    const panGrant = (_, gestureState) => {
      this.material.color.setHex(0x00ff00);
    };
    const panRelease = (_, gestureState) => {
      this.material.color.setHex(0xff0000);
    };
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: panGrant,
      onPanResponderRelease: panRelease,
      onPanResponderTerminate: panRelease,
      onShouldBlockNativeResponder: () => false,
    });
  }

  tick = (dt) => {
    this.mesh.rotation.x += 1 * dt;
    this.mesh.rotation.y += 2 * dt;
  }

  render() {
    return (
      <THREEView
        {...this.panResponder.panHandlers}
        style={this.props.style}
        scene={this.scene}
        camera={this.camera}
        tick={this.tick}
      />
    );
  }
}
