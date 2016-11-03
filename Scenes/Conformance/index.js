'use strict';

import React from 'react';
import { Platform } from 'react-native';

import GLTestReporter from './GLTestReporter';


// `_` defines a regular test.
// `S_` defines a test that gets skipped.
// `I_` defines a test that gets skipped only on iOS.
// If any test is defined using `O_`, all tests not defined using `O_` are skipped.
//
// All forms take an additional array argument with indices of checks that are
// ok to fail on due to expected non-conformance

const _ = (test, skipChecks) => (test.skipChecks = skipChecks, test);
const S_ = (test, ...args) => (test.skip = true, _(test, ...args));
const I_ = (test, ...args) => (test.skip = Platform.OS === 'ios', _(test, ...args));
const O_ = (test, ...args) => (test.only = true, _(test, ...args));

const filter = (tests) => {
  const noSkip = tests.filter(test => !test.skip);
  const only = noSkip.filter(test => test.only);
  return only.length > 0 ? only : noSkip;
};

const tests = filter([
  //// DONE

  _(require('gl-conformance/node-test/more_conformance_constants')),
  _(require('gl-conformance/node-test/more_conformance_getContext')),
  _(require('gl-conformance/node-test/more_conformance_methods')),
  _(require('gl-conformance/node-test/more_functions_bindBuffer')),
  _(require('gl-conformance/node-test/more_functions_bufferData')),
  _(require('gl-conformance/node-test/more_functions_bufferSubData')),
  _(require('gl-conformance/node-test/more_functions_texImage2D')),
  _(require('gl-conformance/node-test/more_functions_vertexAttrib')),
  _(require('gl-conformance/node-test/more_functions_vertexAttribPointer')),

  // `gl.drawArrays(...)` and `gl.drawElements(...)` don't throw errors for
  // bad arguments.
  _(require('gl-conformance/node-test/more_functions_drawArrays'), [
    14, 15, // https://github.com/KhronosGroup/WebGL/blob/18b5d44c5372dc36b78a2d229d3612bdce3aec9a/sdk/tests/conformance/more/functions/drawArrays.html#L92-L93
    20, 21, // https://github.com/KhronosGroup/WebGL/blob/18b5d44c5372dc36b78a2d229d3612bdce3aec9a/sdk/tests/conformance/more/functions/drawArrays.html#L100-L101
  ]),
  _(require('gl-conformance/node-test/more_functions_drawElements'), [
    14, 15, // https://github.com/stackgl/gl-conformance/blob/cfb4649b21cd138c3a6870d4534422287e054d3f/sdk/tests/conformance/more/functions/drawElements.html#L95-L98
    20, 21, // https://github.com/stackgl/gl-conformance/blob/cfb4649b21cd138c3a6870d4534422287e054d3f/sdk/tests/conformance/more/functions/drawElements.html#L106-L109
  ]),


  //// TODO

  // TODO(nikki, sdk12): Implement custom renderbuffer on iOS for
  //                     `gl.readPixels(...)` to work...
  I_(require('gl-conformance/node-test/more_functions_readPixels')),
  I_(require('gl-conformance/node-test/more_functions_uniformf')),
  I_(require('gl-conformance/node-test/more_functions_uniformfArrayLen1')),
  I_(require('gl-conformance/node-test/more_functions_uniformi')),
  I_(require('gl-conformance/node-test/more_functions_uniformMatrix')),
  I_(require('gl-conformance/node-test/more_conformance_webGLArrays'), [
    // TODO(nikki, sdk12): Figure this out...
    198, 200, 201, // https://github.com/stackgl/gl-conformance/blob/cfb4649b21cd138c3a6870d4534422287e054d3f/sdk/tests/conformance/more/conformance/webGLArrays.html#L157-L16
  ]),

  // TODO(nikki, sdk12): Implement functions used in these...
  S_(require('gl-conformance/node-test/more_functions_isTests')),
  S_(require('gl-conformance/node-test/more_functions_texSubImage2D')),
  S_(require('gl-conformance/node-test/more_functions_copyTexImage2D')),
  S_(require('gl-conformance/node-test/more_functions_copyTexSubImage2D')),
  S_(require('gl-conformance/node-test/more_functions_bindFramebufferLeaveNonZero')),
]);


// `GLTestReporter` expects a map of the form `{ [name]: test ... }`
export default (...viewProps) => (
  <GLTestReporter
    {...viewProps}
    testCases={Object.assign(...tests.map((test => ({ [test.name]: test }))))}
  />
);
