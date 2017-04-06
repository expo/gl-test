'use strict';

import React from 'react';

import { GLView } from 'expo';

import REGL from 'regl';


export default class BasicScene extends React.Component {
  static meta = {
    description: 'REGL Basic Scene',
  };

  render() {
    return (
      <GLView
        style={this.props.style}
        onContextCreate={this._onContextCreate}
      />
    );
  }

  _onContextCreate = (gl) => {
    const regl = REGL({ gl });

    const color = this.props.color || [1, 0, 0];

    const command = regl({
      frag: `
  precision highp float;
  void main () {
    gl_FragColor = vec4(${color[0]}, ${color[1]}, ${color[2]}, 1);
  }`,
      vert: `
  precision highp float;
  attribute vec2 position;
  void main () {
    gl_Position = vec4(position, 0, 1);
  }`,
      attributes: {
        position: [
          [-1, 0],
          [0, -1],
          [1, 1],
        ],
      },
      count: 3,
    });

    const frame = () => {
      regl.poll();
      regl.clear({
        color: [0, 0, 0, 1],
        depth: 1,
      });

      command();

      gl.flush();
      gl.endFrameEXP();
      requestAnimationFrame(frame);
    };
    frame();
  }
}
