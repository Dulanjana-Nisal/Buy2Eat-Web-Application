import { Routes, Route } from 'react-router-dom';
import NotFoundPage from '../../shared/pages/NotFoundPage';
import routerConfig from './routeConfig';
import PublicRoute from './PublicRoute';
import LandingPage from '../../features/home/pages/LandingPage';

function AppRouters() {
    return (
        <Routes>
            {
                // Generate routers with router config data
                routerConfig.map((routers) => {
                    let element = routers.element;

                    // switch case for add guard to routers
                    switch (routers.guard) {

                        // add public guard to routers
                        case "public": 
                            element = <PublicRoute>{element}</PublicRoute>
                            break;

                        // ... should add more cases for in coming routers ...
                        
                        default: break;

                    }

                    // return router
                    return (
                        <Route
                            key={routers.path}
                            path={routers.path}
                            element={element}
                        />
                    )
                })
            }

            {/* Home page */}
            <Route path='/' element={<LandingPage />} />

            {/* Not fount route */}
            <Route path='*' element={<NotFoundPage />} />
        </Routes>
    )
}

export default AppRouters;