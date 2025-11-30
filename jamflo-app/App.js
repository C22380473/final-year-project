import AppNavigator from './src/navigation/AppNavigator';
import { RoutineProvider } from './src/contexts/RoutineContext';

export default function App() {
  return (
    <RoutineProvider>
        <AppNavigator />
    </RoutineProvider>
);
}
