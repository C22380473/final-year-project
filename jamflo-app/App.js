import AppNavigator from './src/navigation/AppNavigator';
import { RoutineProvider } from './contexts/RoutineContext';

export default function App() {
  return (
    <RoutineProvider>
        <AppNavigator />
    </RoutineProvider>
);
}
