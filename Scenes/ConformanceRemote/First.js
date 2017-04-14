'use strict';

import React from 'react';
import { ScrollView, View, Text } from 'react-native';

import { GLView, Constants } from 'exponent';

import himalaya from 'himalaya';

//
// Khronos has conformance tests available at
// https://www.khronos.org/registry/webgl/sdk/tests/webgl-conformance-tests.html
//
// These are meant for proper WebGL, which EXGL differs from a little bit.
// The aim with EXGL is to be able to run most things that use WebGL (such as
// three.js, pixi.js, ...) but at the same time reduce the complexity of its
// own implementation. As such, some OpenGL ES things not in WebGL (such as
// binding the same buffer to multiple targets) are also present. The
// Khronos conformance tests test also test for the non-existence of these
// features so there will be some failed tests for this reason. The aim with
// having the conformance tests isn't to check full conformance with WebGL
// but to find where we differ from WebGL and make ensure that those
// differences make sense. These differences are expressed programmatically
// in `failWhitelist` below.
//
// Khronos' tests are meant to run in a browser environment and have some
// test harness utility code. We hack in some polyfills to make them work
// and hope for the best!
//
//   TODO:
//     - parallelize fetching html, js stuff
//

// Whitelist of failure messages that are actually ok since we aren't
// fully conformant
const failWhitelist = [
  // OpenGL ES allows binding the same buffer to multiple targets
  /NO_ERROR.*array buffer to different target/,

  // This requires `gl.drawArrays(...)` to throw an exception for bad arguments
  // that I'm not sure the spec requires
  /testDrawArraysVBOMulti/,

  // This requires `gl.drawElements(...)` to throw an exception for bad arguments
  // that I'm not sure the spec requires
  /testDrawElementsVBOMulti/,
];

// Fetch helpers
const fetchText = async url => await (await fetch(url)).text();
const fetchHTML = async url => himalaya.parse(await fetchText(url));

// Fetch a Khronos conformance test web page and run it in an
// Exponent.GLView. Provides granular reporting and completion notification
// through `onReport` and `onDone` callbacks respectively.
class ConformanceTest extends React.Component {
  render() {
    // eslint-disable-next-line no-unused-vars
    const { url, ...viewProps } = this.props;
    return (
      <View {...viewProps}>
        <GLView style={{ flex: 1 }} onContextCreate={this._onContextCreate} />
      </View>
    );
  }

  _onContextCreate = async gl => {
    gl.enableLogging = true;

    // Some tests rely on gl.canvas being an Object
    gl.canvas = {};

    // Fetch main HTML
    const { url } = this.props;
    const root = await fetchHTML(url);

    // Collect script elements
    const scripts = [];
    const scan = ({
      type,
      tagName,
      attributes = {},
      content,
      children = [],
    }) => {
      // Inline script?
      if (type === 'Element' && tagName === 'script' && content !== undefined) {
        scripts.push({ content, ...attributes });
      }

      // Recurse into children
      children.map(scan);
    };
    scan({ children: root }); // Root is in array form...

    // The test was meant to run in a browser environment so get ready to
    // make some polyfills...
    const polyfills = {};

    // Polyfill to make `new Error('...')` immediately log to console
    polyfills.Error = class Error extends Error {
      constructor(message) {
        super(message);
        if (message) {
          console.log(`Error: ${message}`);
        }
        this.message = message;
      }
    };

    // Dumb polyfill for HTMLElement
    polyfills.HTMLElement = class {};

    // Polyfill for global.document
    const filename = url.replace(/.*\//, '');
    const createElement = () => ({
      appendChild: () => {},
      insertBefore: () => {},
      getContext: () => gl,
      childNodes: [],
      style: {},
    });
    polyfills.document = {
      title: filename,

      createElement: () => createElement(),
      createTextNode: () => createElement(),

      getElementById: id => {
        // 'description's children describe the test, this is useful info
        if (id === 'description') {
          return {
            appendChild: ({ innerHTML }) => {
              const [{ children: [{ content }] }] = himalaya.parse(innerHTML);
              console.log(`${filename}: DESC: ${content}`);
            },
          };
        }

        // Is it a script?
        const script = scripts.find(script => script.id === id);
        if (script) {
          return {
            type: script.type,
            firstChild: {
              nodeType: 3,
              textContent: script.content,
            },
          };
        }

        // Hope for the best...
        return createElement();
      },

      getElementsByTagName: tagName => {
        if (tagName !== 'script') {
          throw new Error(
            `getElementsByTagName(...) polyfill'd only for <script> tags`
          );
        }
        return scripts.map(({ src = '' }) => ({ src }));
      },
    };

    // Polyfill for global.window which is assumed to include a test
    // harness for reporting
    const loadListeners = [];
    polyfills.location = {
      href: url,
      pathname: url, // ¯\_(ツ)_/¯
    };
    polyfills.window = {
      console,
      location: polyfills.location,

      parent: {
        // Tests report checks and completion through
        // window.parent.webglTestHarness
        webglTestHarness: {
          reportResults: (_, success, msg, skipped) => {
            // Check if failing is actually ok due to non-conformance
            let nonConformant = false;
            if (!success && failWhitelist.find(r => msg.match(r))) {
              success = true;
              nonConformant = true;
            }

            this.props.onReport({ success, msg, skipped, nonConformant });

            const passFail = success ? 'PASS' : 'FAIL';
            const consoleFunc = success ? 'log' : 'warn';
            console[consoleFunc](`${filename}: ${passFail}: ${msg}`);
          },
          notifyFinished: () =>
            requestAnimationFrame(() => this.props.onDone()),
        },
      },

      addEventListener: (event, listener) => {
        loadListeners.push(listener);
      },
    };

    // Force 'quiet mode' for 'more' suite of tests
    polyfills.quietMode = () => true;

    // Collect scripts into a single test-running function.
    let testBody = ``;
    for (const { type, src, content } of scripts) {
      if (!type || type.match(/javascript$/)) {
        if (src) {
          const absURL = url.replace(new RegExp('[^/]*$'), src);
          testBody = testBody + (await fetchText(absURL));
        }
        if (content) {
          testBody = testBody + content;
        }
      }
    }
    const testPreamble = Object.keys(polyfills)
      .map(name => `var ${name} = polyfills.${name};`)
      .join('');
    const testWithPolyfills = new Function(
      'polyfills',
      `${testPreamble} ${testBody}`
    );

    // Run test!
    requestAnimationFrame(() => {
      testWithPolyfills(polyfills);
      loadListeners.forEach(listener => listener());
    });
  };
}

// Semi-transparent overlay with test heading, running/done status and
// granular pass/fail messages for each check. This is for a single test.
//
// Green 'PASS' is for passed and conformant, blue 'PASS' is for passed
// and non-conformant (fails Khronos' test but we accept the difference),
// 'FAIL' is for failed
class ConformanceTestResult extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      expanded: true,
    };
  }

  render() {
    const { filename, done, results } = this.props;

    return (
      <View
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          padding: 20,
        }}>
        <Text style={{ color: 'white', fontSize: 24, marginBottom: 5 }}>
          {filename}
        </Text>

        {this.state.expanded
          ? <Text
              style={{
                color: done ? 'white' : 'blue',
                fontSize: 20,
                marginBottom: 5,
              }}>
              {done ? 'DONE' : 'RUNNING...'}
            </Text>
          : null}

        {this.state.expanded
          ? results.map(({ success, msg, skipped, nonConformant }, i) => (
              <View key={i} style={{ flexDirection: 'row' }}>
                <Text
                  style={{
                    flex: 0.2,
                    color: success ? nonConformant ? 'blue' : 'green' : 'red',
                  }}>
                  {success ? 'PASS' : 'FAIL'}
                </Text>
                <Text style={{ flex: 1, color: '#aaa' }}>
                  {msg}
                </Text>
              </View>
            ))
          : null}
      </View>
    );
  }
}

// Run a sequence of Khronos conformance tests given their URLs and
// summarize the results.
class ConformanceTestSuite extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      results: {}, // { [url]: { done, reports } ... }
    };

    // We do our own kind of error reporting
    console.disableYellowBox = true;
  }

  componentDidMount() {
    setTimeout(() => {
      this._startTest(0);
    });
  }

  _startTest(index) {
    // All done?
    if (index >= this.props.urls.length) {
      // NOTE: Report to external thing (CI?) here!
      // console.log('ALL DONE: ', JSON.stringify(this.state.results, null, 2));
    }

    this.setState(({ results }) => ({
      current: index,
      results: {
        ...results,
        [this.props.urls[index]]: {
          done: false,
          reports: [],
        },
      },
    }));
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    const { urls, ...viewProps } = this.props;
    const { current } = this.state;
    return (
      <View {...viewProps}>
        {this._renderConformanceTest(current, () =>
          this._startTest(current + 1)
        )}
        {this._renderResults()}
      </View>
    );
  }

  _renderConformanceTest(index, onDone) {
    const { urls } = this.props;
    if (index >= urls.length) {
      // All done?
      return <View style={{ flex: 1, backgroundColor: 'black' }} />;
    }
    const url = urls[index];

    const updateCurrentResult = update =>
      this.setState(({ results }) => ({
        results: {
          ...results,
          [url]: {
            ...results[url],
            ...update(results[url]),
          },
        },
      }));

    return (
      <ConformanceTest
        style={{ flex: 1 }}
        key={index}
        url={url}
        onDone={() => {
          updateCurrentResult(() => ({ done: true }));
          onDone();
        }}
        onReport={report =>
          updateCurrentResult(({ reports }) => ({
            reports: [...reports, report],
          }))}
      />
    );
  }

  _renderResults() {
    const { urls } = this.props;
    const { results } = this.state;

    return (
      <View
        style={{
          backgroundColor: 'transparent',
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
        }}>
        <View
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            height: Constants.statusBarHeight,
          }}
        />
        <ScrollView style={{ backgroundColor: 'transparent' }}>
          {urls.filter(url => results[url]).map((url, i) => {
            const filename = url.replace(/.*\//, '');
            const { reports, done } = results[url];
            return (
              <ConformanceTestResult
                key={i}
                filename={filename}
                results={reports}
                done={done}
              />
            );
          })}
        </ScrollView>
      </View>
    );
  }
}

// Main component. Display a conformance test suite with listed URLs.
const TESTS_URL = 'https://www.khronos.org/registry/webgl/sdk/tests';
// const TESTS_URL = 'http://192.168.1.74:8000';
export default (paths => () => {
  paths = paths.filter(path => !path.match(/^S/));
  const only = paths.filter(path => path.match(/^O/));
  if (only.length > 0) {
    paths = only.map(path => path.substr(1));
  }

  return (
    <ConformanceTestSuite
      style={{ flex: 1 }}
      urls={paths.map(path => `${TESTS_URL}/${path}`)}
    />
  );
})([
  // Prefix with 'S' to skip, prefix with 'O' to skip everything else

  //// conformance/more

  // conformance
  'conformance/more/conformance/constants.html',
  'conformance/more/conformance/methods.html',

  // functions
  'conformance/more/functions/bindBuffer.html',
  // 'conformance/more/functions/bindFramebufferLeaveNonZero.html',
  'conformance/more/functions/bufferData.html',
  'conformance/more/functions/bufferSubData.html',
  // 'conformance/more/functions/copyTexImage2D.html',
  // 'conformance/more/functions/copyTexSubImage2D.html',
  'conformance/more/functions/drawArrays.html',
  // 'conformance/more/functions/drawArraysOutOfBounds.html',
  'conformance/more/functions/drawElements.html',
  // 'conformance/more/functions/isTests.html',
  'conformance/more/functions/readPixels.html',
  'conformance/more/functions/texImage2D.html',
  // 'conformance/more/functions/texImage2DHTML.html',
  // 'conformance/more/functions/texSubImage2D.html',
  // 'conformance/more/functions/texSubImage2DHTML.html',
  'conformance/more/functions/uniformf.html',
  'conformance/more/functions/uniformfArrayLen1.html',
  'conformance/more/functions/uniformi.html',
  'conformance/more/functions/uniformMatrix.html',
  'conformance/more/functions/vertexAttrib.html',
  'conformance/more/functions/vertexAttribPointer.html',

  // functions (BadArgs)
  // 'conformance/more/functions/bindBufferBadArgs.html',
  // 'conformance/more/functions/bufferDataBadArgs.html',
  // 'conformance/more/functions/bufferSubDataBadArgs.html',
  // 'conformance/more/functions/copyTexImage2DBadArgs.html',
  // 'conformance/more/functions/copyTexSubImage2DBadArgs.html',
  // 'conformance/more/functions/deleteBufferBadArgs.html',
  // 'conformance/more/functions/drawElementsBadArgs.html',
  // 'conformance/more/functions/isTestsBadArgs.html',
  // 'conformance/more/functions/readPixelsBadArgs.html',
  // 'conformance/more/functions/texImage2DBadArgs.html',
  // 'conformance/more/functions/texImage2DHTMLBadArgs.html',
  // 'conformance/more/functions/texSubImage2DBadArgs.html',
  // 'conformance/more/functions/texSubImage2DHTMLBadArgs.html',
  // 'conformance/more/functions/uniformfBadArgs.html',
  // 'conformance/more/functions/uniformiBadArgs.html',
  // 'conformance/more/functions/uniformMatrixBadArgs.html',
  // 'conformance/more/functions/vertexAttribBadArgs.html',
  // 'conformance/more/functions/vertexAttribPointerBadArgs.html',

  //// main

  'conformance/buffers/buffer-bind-test.html',
]);
