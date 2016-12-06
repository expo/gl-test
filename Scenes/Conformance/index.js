'use strict';

import React from 'react';
import { Platform } from 'react-native';

global.Buffer = require('buffer/').Buffer;

import GLTestReporter from './GLTestReporter';


// `_` defines a regular test.
// `S_` defines a test that gets skipped.
// `P_` defines a test that only runs when the predicate is true
// If any test is defined using `O_`, all tests not defined using `O_` are skipped.
//
// `$` defines a regular group.
// `S$` defines a group that gets skipped.
// If any group is defined using `O$`, all groups not defined using `O$` are skipped.
//
// All forms take an additional array argument with indices of checks that are
// ok to fail on due to expected non-conformance

const _ = (test, skipChecks, width, height) => (
  test.skipChecks = skipChecks,
  test.width = width,
  test.height = height,
  test
);
const S_ = (test, ...args) => (test.skip = true, _(test, ...args));
const P_ = (test, pred, ...args) => (test.skip = !pred, _(test, ...args));
const O_ = (test, ...args) => (test.only = true, _(test, ...args));

const filter = (tests) => {
  const noSkip = tests.filter(test => !test.skip);
  const only = noSkip.filter(test => test.only);
  return only.length > 0 ? only : noSkip;
};

const tests = (() => {
  const tests = [];
  const only = [];

  const $ = (arr) => tests.push(...arr);
  const S$ = () => {};
  const O$ = (arr) => only.push(...arr);

  // attribs
  $([
    // TODO(nikki): Fails on Android
    _(require('@exponent/gl-conformance/node-test/attribs_gl-bindAttribLocation-aliasing')),
    // TODO(nikki): Fails on Android
    _(require('@exponent/gl-conformance/node-test/attribs_gl-bindAttribLocation-matrix')),
    _(require('@exponent/gl-conformance/node-test/attribs_gl-disabled-vertex-attrib'), [
      // Needs a fresh context for the last test but we can't create fresh contexts within
      // a test
      16,
    ]),
    _(require('@exponent/gl-conformance/node-test/attribs_gl-enable-vertex-attrib'), [
      // No error check for drawing with attrib without bound buffer
      2,
    ]),
    _(require('@exponent/gl-conformance/node-test/attribs_gl-matrix-attributes')),
    _(require('@exponent/gl-conformance/node-test/attribs_gl-vertex-attrib-zero-issues')),
    _(require('@exponent/gl-conformance/node-test/attribs_gl-vertexattribpointer-offsets'), [], 50, 50),
    _(require('@exponent/gl-conformance/node-test/attribs_gl-vertexattribpointer'), [
      // No `gl.getError()` error on bad arguments
      2, 3, 4, 5, 13, 27, 53, 67, 93, 107, 133, 147, 173, 187, 213, 227, 253, 267,
      293, 307, 327, 328, 330, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342,
      343, 344, 345, 347, 348, 350, 352, 353, 354, 355, 356, 357, 359, 360, 362,
      365, 366, 368, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382,
      383, 385, 386, 388, 390, 391, 392, 393, 394, 395, 397, 398, 400, 403, 404,
      406, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 423,
      424, 426, 428, 429, 430, 431, 432, 433, 435, 436, 438, 441, 442, 444, 447,
      448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 461, 462, 464,
      466, 467, 468, 469, 470, 471, 473, 474, 476, 479, 480, 482, 485, 486, 487,
      488, 489, 490, 491, 492, 493, 494, 495, 496, 497, 499, 500, 502, 504, 505,
      506, 507, 508, 509, 511, 512, 514, 517, 518, 520, 523, 524, 525, 526, 527,
      528, 529, 530, 531, 532, 533, 534, 535, 537, 538, 540, 542, 543, 544, 545,
      546, 547, 549, 550, 552, 555, 556, 558, 561, 562, 563, 564, 565, 566, 567,
      568, 569, 570, 571, 572, 573, 575, 576, 578, 580, 581, 582, 583, 584, 585,
      587, 588, 590, 593, 594, 596, 599, 600, 601, 602, 603, 604, 605, 606, 607,
      608, 609, 610, 611, 613, 614, 616, 618, 619, 620, 621, 622, 623, 625, 626,
      628, 631, 632, 634, 637, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647,
      648, 649, 651, 652, 654, 656, 657, 658, 659, 660, 661, 663, 664, 666, 669,
      670, 672, 675, 676, 677, 678, 679, 680, 681, 682, 683, 684, 685, 686, 687,
      689, 690, 692, 694, 695, 696, 697, 698, 699, 701, 702, 704, 707, 708, 710,
      713, 714, 715, 716, 717, 718, 719, 720, 721, 722, 723, 724, 725, 727, 728,
      730, 732, 733, 734, 735, 736, 737, 739, 740, 742, 745, 746, 748, 751, 752,
      753, 754, 755, 756, 757, 758, 759, 760, 761, 762, 763, 765, 766, 768, 770,
      771, 772, 773, 774, 775, 777, 778, 780,
    ]),
  ]);

  // buffers
  $([
    _(require('@exponent/gl-conformance/node-test/buffers_buffer-bind-test'), [
      // No `gl.INVALID_OPERATION` when binding buffer to different target
      4, 7,
    ]),
    _(require('@exponent/gl-conformance/node-test/buffers_buffer-data-array-buffer-delete')),
    _(require('@exponent/gl-conformance/node-test/buffers_buffer-data-array-buffer'), [
      // `null` data argument to `gl.bufferData(...)` is ok
      7,
    ]),
    _(require('@exponent/gl-conformance/node-test/buffers_element-array-buffer-delete-recreate')),
  ])

  // context
  $([
    _(require('@exponent/gl-conformance/node-test/context_constants-and-properties')),
    _(require('@exponent/gl-conformance/node-test/context_methods'), [
      // Extra method `gl.endFrameEXP()` exists
      2, 3,
    ]),
  ])

  // programs
  $([
    // TODO(nikki): Fails on Android
    S_(require('@exponent/gl-conformance/node-test/programs_get-active-test'), [
      // No `gl.getError()` error on bad arguments
      7, 8, 10, 29, 30, 32,
      // Needs a fresh context for these but we don't support making multiple contexts
      // in one test
      34, 35, 36, 37,
    ]),
    _(require('@exponent/gl-conformance/node-test/programs_gl-bind-attrib-location-long-names-test')),
    _(require('@exponent/gl-conformance/node-test/programs_gl-bind-attrib-location-test'), [
      // Don't pass on Android, maybe OpenGL ES differences... TODO(nikki): Look into this?
      8, 14,
    ]),
    _(require('@exponent/gl-conformance/node-test/programs_gl-get-active-attribute')),
    _(require('@exponent/gl-conformance/node-test/programs_gl-get-active-uniform'), [
      // No `gl.getError()` error on bad arguments
      60,
    ]),
    _(require('@exponent/gl-conformance/node-test/programs_gl-getshadersource'), [
      // On iOS I get a newline addded at the end of the shader source... ¯\_(ツ)_/¯
      1,
    ]),
    // TODO(nikki): Fails on Android
    S_(require('@exponent/gl-conformance/node-test/programs_gl-shader-test'), [
      // We can create GEOMETRY shaders... ¯\_(ツ)_/¯
      2,
    ]),
    _(require('@exponent/gl-conformance/node-test/programs_invalid-UTF-16')),
    _(require('@exponent/gl-conformance/node-test/programs_program-test'), [
      // No error checking...
      4, 5, 6, 7, 33, 34, 35, 36, 37, 38,
      // OpenGL ES on iOS seems to differ here, we'll just go with it...
      54, 60,
    ]),
    _(require('@exponent/gl-conformance/node-test/programs_use-program-crash-with-discard-in-fragment-shader')),
  ])

  // reading
  // TODO(nikki): This only mostly passes...
  O$([
    _(require('@exponent/gl-conformance/node-test/reading_read-pixels-pack-alignment'), [], 32, 32),
    _(require('@exponent/gl-conformance/node-test/reading_read-pixels-test'), [], 2, 2, [
      // No error checking...
      114, 115, 116, 117, 118,
      // These checks require synchronously resizing the canvas which doesn't really work out...
      121, 122, 123,
    ]),
  ])

  // rendering
  $([
    _(require('@exponent/gl-conformance/node-test/rendering_culling')),
    _(require('@exponent/gl-conformance/node-test/rendering_gl-clear')),
    _(require('@exponent/gl-conformance/node-test/rendering_gl-drawarrays')),
    _(require('@exponent/gl-conformance/node-test/rendering_gl-drawelements'), [
      // Don't care about INVALID_ENUM for UNSIGNED_INT...
      6
    ]),
    _(require('@exponent/gl-conformance/node-test/rendering_gl-scissor-test')),
    _(require('@exponent/gl-conformance/node-test/rendering_gl-viewport-test')),
    _(require('@exponent/gl-conformance/node-test/rendering_line-loop-tri-fan')),
    _(require('@exponent/gl-conformance/node-test/rendering_many-draw-calls')),
    _(require('@exponent/gl-conformance/node-test/rendering_more-than-65536-indices'), [], 1, 1),
    _(require('@exponent/gl-conformance/node-test/rendering_negative-one-index'), [], 50, 50),
    _(require('@exponent/gl-conformance/node-test/rendering_point-no-attributes'), [], 1, 1),
    _(require('@exponent/gl-conformance/node-test/rendering_point-size'), [], 2, 2),
    _(require('@exponent/gl-conformance/node-test/rendering_point-with-gl-pointcoord-in-fragment-shader')),
    _(require('@exponent/gl-conformance/node-test/rendering_polygon-offset')),
    _(require('@exponent/gl-conformance/node-test/rendering_simple')),
    _(require('@exponent/gl-conformance/node-test/rendering_triangle'), [], 50, 50),
    _(require('@exponent/gl-conformance/node-test/rendering_framebuffer-switch')),
    _(require('@exponent/gl-conformance/node-test/rendering_framebuffer-texture-switch')),
    _(require('@exponent/gl-conformance/node-test/rendering_gl-scissor-fbo-test')),
  ]);

  // textures
  $([
    _(require('@exponent/gl-conformance/node-test/textures_copy-tex-image-2d-formats'), [
      // Don't care about error checking...
      42, 46, 50,
    ], 2, 2),
    _(require('@exponent/gl-conformance/node-test/textures_copy-tex-image-and-sub-image-2d')),
    _(require('@exponent/gl-conformance/node-test/textures_default-texture')),
    _(require('@exponent/gl-conformance/node-test/textures_gl-get-tex-parameter')),
    _(require('@exponent/gl-conformance/node-test/textures_mipmap-fbo')),
    _(require('@exponent/gl-conformance/node-test/textures_tex-image-and-sub-image-2d-with-array-buffer-view')),
    _(require('@exponent/gl-conformance/node-test/textures_tex-image-and-uniform-binding-bugs')),
    _(require('@exponent/gl-conformance/node-test/textures_tex-image-webgl')),
    _(require('@exponent/gl-conformance/node-test/textures_tex-image-with-invalid-data')),
    _(require('@exponent/gl-conformance/node-test/textures_tex-input-validation')),
    _(require('@exponent/gl-conformance/node-test/textures_tex-sub-image-2d')),
    _(require('@exponent/gl-conformance/node-test/textures_texture-attachment-formats')),
    _(require('@exponent/gl-conformance/node-test/textures_texture-clear')),
    _(require('@exponent/gl-conformance/node-test/textures_texture-copying-feedback-loops')),
    _(require('@exponent/gl-conformance/node-test/textures_texture-draw-with-2d-and-cube')),
    _(require('@exponent/gl-conformance/node-test/textures_texture-fakeblack')),
    _(require('@exponent/gl-conformance/node-test/textures_texture-formats-test')),
    _(require('@exponent/gl-conformance/node-test/textures_texture-mips')),
    _(require('@exponent/gl-conformance/node-test/textures_texture-size-cube-maps')),
    _(require('@exponent/gl-conformance/node-test/textures_texture-size-limit')),
    _(require('@exponent/gl-conformance/node-test/textures_texture-size')),
    _(require('@exponent/gl-conformance/node-test/textures_texture-sub-image-cube-maps')),
    _(require('@exponent/gl-conformance/node-test/textures_texture-upload-cube-maps')),
  ])

  // more_conformance
  $([
    _(require('@exponent/gl-conformance/node-test/more_conformance_constants')),
    _(require('@exponent/gl-conformance/node-test/more_conformance_getContext')),
    _(require('@exponent/gl-conformance/node-test/more_conformance_methods')),
    _(require('@exponent/gl-conformance/node-test/more_conformance_webGLArrays'), [
      // TODO(nikki, sdk12): Figure this out...
      198, 200, 201,
    ]),
  ])

  // more_functions
  $([
    _(require('@exponent/gl-conformance/node-test/more_functions_bindBuffer')),
    _(require('@exponent/gl-conformance/node-test/more_functions_bufferData')),
    _(require('@exponent/gl-conformance/node-test/more_functions_bufferSubData')),
    _(require('@exponent/gl-conformance/node-test/more_functions_readPixels')),
    _(require('@exponent/gl-conformance/node-test/more_functions_texImage2D')),
    _(require('@exponent/gl-conformance/node-test/more_functions_uniformMatrix')),
    _(require('@exponent/gl-conformance/node-test/more_functions_uniformf')),
    _(require('@exponent/gl-conformance/node-test/more_functions_uniformfArrayLen1')),
    _(require('@exponent/gl-conformance/node-test/more_functions_uniformi')),
    _(require('@exponent/gl-conformance/node-test/more_functions_vertexAttrib')),
    _(require('@exponent/gl-conformance/node-test/more_functions_vertexAttribPointer')),
    _(require('@exponent/gl-conformance/node-test/more_functions_drawArrays'), [
      // `gl.drawArrays(...)` doesn't throw an error for bad arguments
      14, 15, 20, 21,
    ]),
    _(require('@exponent/gl-conformance/node-test/more_functions_drawElements'), [
      // `gl.drawElements(...)` doesn't throw an error for bad arguments
      14, 15, 20, 21,
    ]),
    _(require('@exponent/gl-conformance/node-test/more_functions_bindFramebufferLeaveNonZero')),
  ])

  return filter(only.length > 0 ? only : tests);
})();


const _tests = filter([
  //// DONE



  //// TODO

  // Not sure why this fails
  S_(require('@exponent/gl-conformance/node-test/attribs_gl-vertex-attrib-render')),

  // `gl.getVertexAttrib()` not yet implemented
  S_(require('@exponent/gl-conformance/node-test/attribs_gl-vertex-attrib')),

  // Unimplemented functions
  S_(require('@exponent/gl-conformance/node-test/more_functions_isTests')),
  S_(require('@exponent/gl-conformance/node-test/more_functions_texSubImage2D')),
  S_(require('@exponent/gl-conformance/node-test/more_functions_copyTexImage2D')),
  S_(require('@exponent/gl-conformance/node-test/more_functions_copyTexSubImage2D')),

  // No buffer index validation
  S_(require('@exponent/gl-conformance/node-test/buffers_index-validation-copies-indices')),
  S_(require('@exponent/gl-conformance/node-test/buffers_index-validation-crash-with-buffer-sub-data')),
  S_(require('@exponent/gl-conformance/node-test/buffers_index-validation-large-buffer')),
  S_(require('@exponent/gl-conformance/node-test/buffers_index-validation-verifies-too-many-indices')),
  S_(require('@exponent/gl-conformance/node-test/buffers_index-validation-with-resized-buffer')),
  S_(require('@exponent/gl-conformance/node-test/buffers_index-validation')),

]);


export default class Conformance extends React.Component {
  static meta = {
    description: `Khronos' WebGL Spec Conformance Test`,
  };

  render() {
    // `GLTestReporter` expects a map of the form `{ [name]: test ... }`
    return (
      <GLTestReporter
        {...this.props}
        testCases={Object.assign(...tests.map((test => ({ [test.name]: test }))))}
      />
    );
  }
}
