'use strict';

import React from 'react';

import { NativeModules } from 'react-native';

import {GLView} from 'expo-gl';

const vertSrc = `
  precision highp float;
  attribute vec2 position;
  varying vec2 uv;
  void main () {
    uv = position;
    gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
  }`;

const fragSrc = `
  precision highp float;
  uniform sampler2D texture;
  varying vec2 uv;
  void main () {
    gl_FragColor = vec4(1.0 - texture2D(texture, vec2(uv.x, uv.y)).xyz, 0.0);
  }`;

export default class BasicScene extends React.Component {
  static meta = {
    description: 'Basic Scene with Camera Stream',
  };

  constructor(props, context) {
    super(props, context);
  }

  render() {
    return <GLView style={this.props.style} onContextCreate={this._onContextCreate} />;
  }

  _onContextCreate = gl => {
    gl.enableLogging = true;

    (async () => {
      const { exglObjId } = await NativeModules.ExponentGLObjectManager.createObjectAsync({
        exglCtxId: gl.__exglCtxId,
        texture: {
          camera: {
            position: 'front',
          },
        },
      });
      this._texture = new WebGLTexture(exglObjId);
    })();

    // Compile vertex and fragment shader
    const vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vert, vertSrc);
    gl.compileShader(vert);
    const frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(frag, fragSrc);
    gl.compileShader(frag);

    // Link together into a program
    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    // Save position attribute
    const positionAttrib = gl.getAttribLocation(program, 'position');

    // Create buffer
    const buffer = gl.createBuffer();

    // Use texture unit 0 for texture
    gl.uniform1i(gl.getUniformLocation(program, 'texture'), 0);

    /// Animate!
    let skip = false;
    const animate = () => {
      try {
        if (skip) {
          // return;
        }

        // Clear
        gl.clearColor(0, 0, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Bind texture
        if (this._texture) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, this._texture);
        }

        // Bind buffer, program and position attribute for use
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.useProgram(program);
        gl.enableVertexAttribArray(positionAttrib);
        gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);

        // Buffer data and draw!
        const verts = new Float32Array([-2, 0, 0, -2, 2, 2]);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

        // Submit frame
        gl.flush();
        gl.endFrameEXP();
      } finally {
        skip = !skip;
        gl.enableLogging = false;
        requestAnimationFrame(animate);
      }
    };
    animate();
  };
}
