'use strict';

import React from 'react';

import Expo from 'expo';

const THREE = require('three');
const THREEView = Expo.createTHREEViewClass(THREE);


export default class BasicScene extends React.Component {
  static meta = {
    description: 'THREE Texture Scene',
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      ready: false,
    };
  }

  componentDidMount() {
    this.init();
  }

  async init() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, 1, 1, 10000);
    this.camera.position.z = 1000;

    this.geometry = new THREE.BoxGeometry(200, 200, 200);

    this._textureAsset = Expo.Asset.fromModule(
      require('../Assets/avatar2.png'));
    await this._textureAsset.downloadAsync();
    this.material = new THREE.MeshBasicMaterial({
      map: THREEView.textureFromAsset(this._textureAsset),
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    this.setState({ ready: true });
 }

  tick = (dt) => {
    this.mesh.rotation.x += 1 * dt;
    this.mesh.rotation.y += 2 * dt;
  }

  render() {
    return this.state.ready ? (
      <THREEView
        style={this.props.style}
        scene={this.scene}
        camera={this.camera}
        tick={this.tick}
      />
    ) : (
      <Expo.Components.AppLoading />
    );
  }
}
