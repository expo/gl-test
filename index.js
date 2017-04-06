import React from 'react';
import Expo from 'expo';
import { Router } from './navigation';
import { NavigationProvider, StackNavigation } from '@expo/ex-navigation';
import Scenes from './Scenes';

const initialRoute = 'home';
// const initialRoute = Router.getRoute('scene', { component: Scenes.Conformance });

Expo.registerRootComponent(() => (
  <NavigationProvider router={Router}>
    <StackNavigation initialRoute={initialRoute} />
  </NavigationProvider>
));
