'use strict';

import React from 'react';

import { createTHREEViewClass } from 'expo';

const THREE = require('three');
const THREEView = createTHREEViewClass(THREE);

export default class BasicScene extends React.Component {
  static meta = {
    description: 'THREE Perf Test Scene',
  };

  componentWillMount() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, 1, 1, 10000);
    this.camera.position.z = 3200;

    this.objects = [];

    const material = new THREE.MeshNormalMaterial();

    const loader = new THREE.JSONLoader();
    const json = require('../Assets/Suzanne.json');
    const geometry = loader.parse(json).geometry;
    geometry.computeVertexNormals();

    for (let i = 0; i < 1500; ++i) {
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.x = Math.random() * 8000 - 4000;
      mesh.position.y = Math.random() * 8000 - 4000;
      mesh.position.z = Math.random() * 8000 - 4000;
      mesh.rotation.x = Math.random() * 2 * Math.PI;
      mesh.rotation.y = Math.random() * 2 * Math.PI;
      mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50 + 100;

      this.objects.push(mesh);
      this.scene.add(mesh);
    }
  }

  tick = dt => {
    for (let i = 0, il = this.objects.length; i < il; ++i) {
      this.objects[i].rotation.x += 0.3 * dt;
      this.objects[i].rotation.y += 0.6 * dt;
    }
  };

  render() {
    return (
      <THREEView
        style={this.props.style}
        scene={this.scene}
        camera={this.camera}
        tick={this.tick}
      />
    );
  }
}
