'use strict';

import React from 'react';

import { GLView } from 'expo';

import REGL from 'regl';
import model from 'bunny';
import mat4 from 'gl-mat4';
import normals from 'angle-normals';

const DIST = 50;

export default class BasicScene extends React.Component {
  static meta = {
    description: 'REGL Lighting Scene',
  };

  render() {
    return (
      <GLView
        style={this.props.style}
        onContextCreate={this._onContextCreate}
      />
    );
  }

  _onContextCreate = gl => {
    const regl = REGL({ gl });

    const drawModel = regl({
      vert: `
  precision highp float;
  attribute vec3 position, normal;
  uniform mat4 view, projection;
  varying vec3 fragNormal, fragPosition;
  void main() {
    fragNormal = normal;
    fragPosition = position;
    gl_Position = projection * view * vec4(position, 1);
  }`,
      frag: `
  precision highp float;
  struct Light {
    vec3 color;
    vec3 position;
  };
  uniform Light lights[4];
  varying vec3 fragNormal, fragPosition;
  void main() {
    vec3 normal = normalize(fragNormal);
    vec3 light = vec3(0, 0, 0);
    for (int i = 0; i < 4; ++i) {
      vec3 lightDir = normalize(lights[i].position - fragPosition);
      float diffuse = max(0.0, dot(lightDir, normal));
      light += diffuse * lights[i].color;
    }
    gl_FragColor = vec4(light, 1);
  }`,
      attributes: {
        position: model.positions,
        normal: normals(model.cells, model.positions),
      },
      elements: model.cells,
      uniforms: {
        view: ({ time: t }) =>
          mat4.lookAt(
            [],
            [DIST * Math.cos(t), 2.5, DIST * Math.sin(t)],
            [0, 2.5, 0],
            [0, 1, 0]
          ),
        projection: mat4.perspective(
          [],
          Math.PI / 4,
          gl.drawingBufferWidth / gl.drawingBufferHeight,
          0.01,
          1000
        ),
        'lights[0].color': [1, 0, 0],
        'lights[1].color': [0, 1, 0],
        'lights[2].color': [0, 0, 1],
        'lights[3].color': [1, 1, 0],
        'lights[0].position': ({ time: t }) => [
          10 * Math.cos(0.09 * t),
          10 * Math.sin(0.09 * (2 * t)),
          10 * Math.cos(0.09 * (3 * t)),
        ],
        'lights[1].position': ({ time: t }) => [
          10 * Math.cos(0.05 * (5 * t + 1)),
          10 * Math.sin(0.05 * (4 * t)),
          10 * Math.cos(0.05 * (0.1 * t)),
        ],
        'lights[2].position': ({ time: t }) => [
          10 * Math.cos(0.05 * (9 * t)),
          10 * Math.sin(0.05 * (0.25 * t)),
          10 * Math.cos(0.05 * (4 * t)),
        ],
        'lights[3].position': ({ time: t }) => [
          10 * Math.cos(0.1 * (0.3 * t)),
          10 * Math.sin(0.1 * (2.1 * t)),
          10 * Math.cos(0.1 * (1.3 * t)),
        ],
      },
    });

    const frame = () => {
      regl.poll();
      regl.clear({
        color: [0, 0, 0, 1],
        depth: 1,
      });

      drawModel();

      gl.flush();
      gl.endFrameEXP();
      requestAnimationFrame(frame);
    };
    frame();
  };
}
