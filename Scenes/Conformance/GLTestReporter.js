'use strict';

import React from 'react';
import { ScrollView, View, Text }  from 'react-native';
import { Constants } from 'exponent';
import GLRunTest from './GLRunTest';

const STATE_COLORS = {
  'fail': 'red',
  'success': 'green',
  'pending': '#ccc',
  'running': 'yellow',
};

class GLTestReporter extends React.Component {
  constructor(props, context) {
    super(props, context);

    const { testCases } = props;

    this.state = {
      testLogs: Object.keys(testCases).map((name, id) => {
        return {
          name,
          messages: [],
          state: id ? 'pending' : 'running',
        };
      }),
      currentTestId: 0,
    };
  }

  render() {
    const { testCases } = this.props;
    const { testLogs, currentTestId } = this.state;

    const self = this;

    return (
      <View
        style={{
            backgroundColor: 'black',
            position: 'absolute',
            left: 0, top: 0, right: 0, bottom: 0,
          }}>
        <View
          style={{
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              height: Constants.statusBarHeight,
            }}
        />
        {
          testLogs.map(({ name, messages, state }, id) => (
            id === currentTestId ? (
              <GLRunTest
                key={name}
                style={{ width: 200, height: 200 }}
                testName={name}
                testCase={testCases[name]}
                onDone={function(result) {
                    self._onTestFinish(result);
                  }}
              />
            ) : null
          ))
        }
        <ScrollView style={{ backgroundColor: 'transparent' }}>
        {
          testLogs.map(({ name, messages, state }, id) => (
            <View key={name}>
              <Text style={{color: STATE_COLORS[state], fontSize: 24}}>
                {`${name} - ${state}`}
              </Text>
              {messages.map((message, id) =>
                <View key={`${name}:${id}`}>
                  <Text
                    style={{
                      marginLeft: 20,
                      color: STATE_COLORS[state],
                      fontSize: 12,
                    }}>
                    {message}
                  </Text>
                </View>
              )}
            </View>
          ))
        }
        </ScrollView>
      </View>
    );
  }

  _onTestFinish({messages, success}) {
    const { testLogs, currentTestId } = this.state;
    const nextLogs = testLogs.slice();
    nextLogs[currentTestId] = {
      name: testLogs[currentTestId].name,
      messages,
      state: success ? 'success' : 'fail',
    };
    const nextCase = nextLogs[currentTestId + 1];
    if (nextCase) {
      nextLogs[currentTestId + 1] = {
        name: nextCase.name,
        messages: [],
        state: 'running',
      };
    }
    this.setState({
      testLogs: nextLogs,
      currentTestId: currentTestId + 1,
    });
  }
}

export default GLTestReporter;
