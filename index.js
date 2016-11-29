import React from 'react';
import Exponent from 'exponent';
import { Router } from './navigation';
import { NavigationProvider, StackNavigation } from '@exponent/ex-navigation';
import Scenes from './Scenes';

// const initialRoute = 'home';
const initialRoute = Router.getRoute('scene', { component: Scenes.Conformance });

Exponent.registerRootComponent(() => (
  <NavigationProvider router={Router}>
    <StackNavigation initialRoute={initialRoute} />
  </NavigationProvider>
));
