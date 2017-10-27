import React from 'react';
import { StackNavigation, createRouter } from '@expo/ex-navigation';
import {
  InteractionManager,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import Scenes from './Scenes';

class SceneScreen extends React.Component {
  static route = {
    navigationBar: {
      title(params) {
        return params.title || params.component.meta.description;
      },
      translucent: true,
      tintColor: '#000',
    },
  };

  state = {
    transitionComplete: false,
  };

  componentWillMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({ transitionComplete: true });
    });
  }

  render() {
    let { params } = this.props.route;
    let SceneComponent;
    if (this.state.transitionComplete) {
      SceneComponent = params.component;
    } else {
      SceneComponent = View;
    }

    return (
      <View
        style={{
          ...this.props.route.getContentInsetsStyle(),
          flex: 1,
          backgroundColor: 'black',
        }}>
        <SceneComponent style={{ flex: 1 }} />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}

class HomeScreen extends React.Component {
  static route = {
    navigationBar: {
      title: 'EXGL Examples',
      translucent: true,
    },
  };

  render() {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={this.props.route.getContentContainerStyle()}>
        {Object.values(Scenes).map(this._renderSceneOption)}
        <StatusBar barStyle="default" />
      </ScrollView>
    );
  }

  _renderSceneOption = (SceneComponent, i) => {
    return (
      <TouchableHighlight
        key={i}
        style={styles.row}
        underlayColor="#eee"
        onPress={() => this._navigateToScene(SceneComponent)}>
        <Text>{SceneComponent.meta.description || 'Scene missing description'}</Text>
      </TouchableHighlight>
    );
  };

  _navigateToScene = SceneComponent => {
    this.props.navigator.push('scene', {
      title: SceneComponent.meta.description,
      component: SceneComponent,
    });
  };
}

export const Router = createRouter(
  () => ({
    home: () => HomeScreen,
    scene: () => SceneScreen,
  }),
  { ignoreSerializableWarnings: true }
);

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
});
