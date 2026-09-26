import { Routes, Route } from 'react-router-dom';
import NotFoundPage from '../../shared/pages/NotFoundPage';
import AuthRouters from './AuthRoutes';

function AppRouters() {
    return (
        <Routes>
            <Route path='/*' element={<AuthRouters />} />
            <Route path='*' element={<NotFoundPage />} />
        </Routes>
    )
}

export default AppRouters;