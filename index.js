import React from 'react';
import Exponent from 'exponent';
import { Router } from './navigation';
import { NavigationProvider, StackNavigation } from '@exponent/ex-navigation';

let initialRoute = 'home';

// import Scenes from './Scenes';
// initialRoute = Router.getRoute('scene', {component: Scenes.BasicScene});

Exponent.registerRootComponent(() => (
  <NavigationProvider router={Router}>
    <StackNavigation initialRoute={initialRoute} />
  </NavigationProvider>
));
