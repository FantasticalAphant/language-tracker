import {BrowserRouter} from 'react-router-dom';
import {AuthProvider} from "../src/contexts/AuthContext.jsx";

// eslint-disable-next-line react/prop-types
export const TestWrapper = ({children}) => {
    return (
        <BrowserRouter>
            <AuthProvider>
                {children}
            </AuthProvider>
        </BrowserRouter>
    );
};