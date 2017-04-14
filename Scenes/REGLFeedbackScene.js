'use strict';

import React from 'react';

import { GLView } from 'expo';

import REGL from 'regl';

export default class BasicScene extends React.Component {
  static meta = {
    description: 'REGL Feedback Scene',
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

    const pixels = regl.texture();

    const drawFeedback = regl({
      frag: `
      precision mediump float;
      uniform sampler2D texture;
      uniform vec2 mouse;
      uniform float t;
      varying vec2 uv;
      void main () {
        float dist = length(gl_FragCoord.xy - mouse);
        gl_FragColor = vec4(0.98 * texture2D(texture,
                                             uv + cos(t) * vec2(0.5 - uv.y, uv.x - 0.5) - sin(2.0 * t) * (uv - 0.5)).rgb, 1) +
                       exp(-0.01 * dist) * vec4(
                         1.0 + cos(2.0 * t),
                         1.0 + cos(2.0 * t + 1.5),
                         1.0 + cos(2.0 * t + 3.0),
                         0.0);
      }`,

      vert: `
      precision mediump float;
      attribute vec2 position;
      varying vec2 uv;
      void main () {
        uv = position;
        gl_Position = vec4(2.0 * position - 1.0, 0, 1);
      }`,

      attributes: {
        position: [-2, 0, 0, -2, 2, 2],
      },

      uniforms: {
        texture: pixels,
        mouse: [100, 100],
        t: ({ tick }) => 0.01 * tick,
      },

      count: 3,
    });

    const frame = () => {
      regl.poll();
      regl.clear({
        color: [0, 0, 0, 1],
        depth: 1,
      });

      drawFeedback();
      pixels({ copy: true });

      gl.flush();
      gl.endFrameEXP();
      requestAnimationFrame(frame);
    };
    frame();
  };
}
