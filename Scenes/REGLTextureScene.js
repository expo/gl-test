'use strict';

import React from 'react';
import { Alert } from 'react-native';

import Expo from 'expo';

import EXGLView from '../EXGLView';

import REGL from 'regl';


export default class BasicScene extends React.Component {
  static meta = {
    description: 'REGL Texture Scene',
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      ready: false,
    };
  }

  componentDidMount() {
    (async () => {
      this._textureAsset = Expo.Asset.fromModule(
        require('../Assets/avatar2.png'));
      await this._textureAsset.downloadAsync();
      this.setState({ ready: true });
    })();
  }

  render() {
    return this.state.ready ? (
      <EXGLView
        style={this.props.style}
        onContextCreate={this._onContextCreate}
      />
    ) : (
      <Expo.Components.AppLoading />
    );
  }

  _onContextCreate = (_, gl) => {
    try {
      const regl = REGL({ gl });

      const command = regl({
        frag: `
  precision mediump float;
  uniform sampler2D texture;
  varying vec2 uv;
  void main () {
    gl_FragColor = texture2D(texture, uv);
  }`,
        vert: `
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  void main () {
    uv = position;
    gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
  }`,
        attributes: {
          position: [
            [-2, 0],
            [0, -2],
            [2, 2],
          ],
        },
        uniforms: {
          texture: (() => {
            const width = this._textureAsset.width;
            const height = this._textureAsset.height;
            const data = new ArrayBuffer(width * height * 4);
            data.localUri = this._textureAsset.localUri;
            data.__ejTypedArrayType = null;
            return regl.texture({ width, height, data });
          })(),
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
    } catch (e) {
      Alert.alert('Error!', e.message);
    }
  }
}
