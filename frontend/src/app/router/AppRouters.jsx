import { Routes, Route } from 'react-router-dom';
import NotFoundPage from '../../shared/pages/NotFoundPage';
import AuthRouter from './AuthRoutes';

function AppRouter() {
    return (
        <Routes>
            {/* Auth routers */}
            <AuthRouter />

            {/* Notfound router */}
            <Route path='*' element={<NotFoundPage />} />
        </Routes>
    )
}

export default AppRouter;