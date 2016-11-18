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

  _onContextCreate = (gl) => {
    const { testCase, testName, onDone } = this.props;

    let testCounter = 0;
    let success = true;

    const messages = [];

    function log(message, state) {
      messages.push({ text: message, state });
      console.log(message);
    }

    log(`# ${testName}`);

    function pass(message) {
      testCounter += 1;
      log(`pass ${testCounter} - ${message || 'pass'}`, 'success');
    }

    function fail(message) {
      testCounter += 1;
      if (testCase.skipChecks && testCase.skipChecks.includes(testCounter)) {
        log(`diff ${testCounter} - ${message || 'fail'}`, 'success');
      } else {
        log(`fail ${testCounter} - ${message || 'fail'}`, 'fail');
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
        return gl;
      },
    });
  }
}

export default GLRunTest;
