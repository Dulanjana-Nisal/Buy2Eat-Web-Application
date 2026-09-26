import { Routes, Route } from 'react-router-dom';
import NotFoundPage from '../../shared/pages/NotFoundPage';

function AppRouter(){
    return(
        <>
            <Routes>
                <Route path='*' element={<NotFoundPage />} />
            </Routes>  
        </>
    )
}

export default AppRouter;