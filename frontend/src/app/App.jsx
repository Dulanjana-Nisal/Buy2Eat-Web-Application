import { BrowserRouter } from 'react-router-dom';
import AppRouters from './router/AppRouters';
import AppProvider from './providers/AppProviders';

/** Renders the application router and its authentication routes. */
function App() {
  return (
    <AppProvider>
      <BrowserRouter>
          <AppRouters />
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
