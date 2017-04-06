'use strict';

import React from 'react';

import Expo from 'expo';

const THREE = require('three');
global.THREE = THREE;
require('three/examples/js/loaders/OBJLoader');
const THREEView = Expo.createTHREEViewClass(THREE);

if (!console.time) {
  console.time = () => {};
}
if (!console.timeEnd) {
  console.timeEnd = () => {};
}


export default class BasicScene extends React.Component {
  static meta = {
    description: 'THREE Object Scene',
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

    // lights
    const ambient = new THREE.AmbientLight(0x101030);
		this.scene.add(ambient);
		const directionalLight = new THREE.DirectionalLight(0xffeedd);
		directionalLight.position.set(0, 0, 1);
		this.scene.add(directionalLight);

    // camera
    this.camera = new THREE.PerspectiveCamera(75, 1, 1, 10000);
    this.camera.position.z = 250;

    // action!
    const loader = new THREE.OBJLoader();
    this.model = await new Promise((resolve, reject) =>
      loader.load(
        Expo.Asset.fromModule(require('../Assets/model.obj')).uri,
        resolve,
        () => {},
        reject));
    const textureAsset = Expo.Asset.fromModule(
      require('../Assets/UV_Grid_Sm.png'));
    await textureAsset.downloadAsync();
    const texture = THREEView.textureFromAsset(textureAsset);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // child.material.color = 0x00ff00;
        child.material.map = texture;
      }
    });
    this.model.position.y -= 95;
    this.scene.add(this.model);

    this.setState({ ready: true });
 }

  tick = (dt) => {
    this.model.rotation.y += 2 * dt;
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
