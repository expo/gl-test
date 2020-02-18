import React from 'react';
import { createAppContainer } from 'react-navigation';
import { Router } from './navigation';

const initialRoute = 'home';
// const initialRoute = Router.getRoute('scene', { component: Scenes.Conformance });

export default function App() {
  const Root = createAppContainer(Router);
  return <Root />
}
