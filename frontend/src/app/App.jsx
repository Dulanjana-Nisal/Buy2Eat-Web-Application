import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouters';
import AppProvider from './providers/AppProviders';

/** Renders the application router and its authentication routes. */
function App() {
  return (
    <AppProvider>
      <BrowserRouter>
          <AppRouter />
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
