'use strict';

import React from 'react';
import { View }  from 'react-native';
import { GLView } from 'exponent';

class GLRunTest extends React.Component {
  render() {
    // eslint-disable-next-line no-unused-vars
    const { testCase, testName, onDone, ...viewProps } = this.props;
    return (
      <View {...viewProps} >
        <GLView
          style={{ flex: 1 }}
          onContextCreate={this._onContextCreate}
        />
      </View>
    );
  }

  _onContextCreate = async (gl) => {
    const { testCase, testName, onDone } = this.props;

    // shim conformance suite methods for resize/destroy context
    if (!('resize' in gl)) {
      gl.resize = function() {};
    }
    if (!('destroy' in gl)) {
      gl.destroy = function() {};
    }

    let testCounter = 0;
    let success = true;

    const messages = [];

    function log(message) {
      messages.push(message);
      console.log(message);
    }

    log(`# ${testName}`);

    function pass(message) {
      testCounter += 1;
      log(`pass ${testCounter} - ${message || 'pass'}`);
    }

    function fail(message) {
      testCounter += 1;
      if (testCase.skipChecks && testCase.skipChecks.includes(testCounter)) {
        log(`diff ${testCounter} - ${message || 'fail'}`);
      } else {
        log(`fail ${testCounter} - ${message || 'fail'}`);
        success = false;
      }
    }

    testCase({
      // We only implement a minimal subset of the tape interface.
      // gl-conformance just uses:
      //    * pass
      //    * fail
      //    * ok
      //    * end
      tape: {
        pass,
        fail,
        ok(pred, message) {
          if (pred) {
            pass(message);
          } else {
            fail(message);
          }
        },
        end() {
          if (onDone) {
            setTimeout(() => {
              onDone({
                messages,
                success,
              });
            }, 1);
          }
        },
      },
      createContext(width, height, options) {
        gl.resize(width, height);
        return gl;
      },
    });
  }
}

export default GLRunTest;
