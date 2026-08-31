    import { createContext, useContext, useState } from "react";


    // create the context

    const AuthContext = createContext(null);
    const DUMMY_USERS = [
        {
            id: 1,
            email: "admin@smartagri.com",
            password: "Admin@123",
            role: "admin",
            firstName: "Admin",
            lastName: "User",
        },

        {
            id: 2,
            email: "user@smartagri.com",
            password: "User@123",
            role: "user",
            firstName: "User",
            lastName: "Muzamil Kehar"

        }
    ];

    //Auth Provider wraps the whole app

    export const AuthProvider = ({children}) => {
        const [currentUser, setCurrentUser] = useState(null);


        // LoginIn Function - checks credientilas and set users
        const login = (email, password) => {
            const found = DUMMY_USERS.find(
                (u) => u.email === email && u.password === password
            );

            if (found) {
                const {password: _, ...safeUser} = found;
                setCurrentUser(safeUser);
                return {success: true, user: safeUser};
            }

            return {success: false};
        };

        // Logout Function
        const logout = () => setCurrentUser(null);


        // Helper Checks

        const isAdmin = currentUser?.role === "admin";
        const isUser = currentUser?.role === "user";
        const isLoggedIn = !!currentUser;

        return (
            <AuthContext.Provider value={{
                currentUser,
                login,
                logout,
                isAdmin,
                isUser,
                isLoggedIn
            }}>
                {children}
            </AuthContext.Provider>
        );
    };

    export const useAuth = () => useContext(AuthContext);
