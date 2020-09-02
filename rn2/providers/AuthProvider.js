import React, { useContext, useState } from "react";
import Realm from "realm";
import { Alert } from "react-native";
import { getRealmApp } from "../getRealmApp";

// Access the Realm App.
const app = getRealmApp();

// Create a new Context object that will be provided to descendants of
// the AuthProvider.
const AuthContext = React.createContext(null);

// The AuthProvider is responsible for user management and provides the
// AuthContext value to its descendants. Components under an AuthProvider can
// use the useAuth() hook to access the auth value.
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // The signIn function takes an email and password and uses the
  // emailPassword authentication provider to log in.
  const signIn = async (email, password) => {
    try {
      const creds = Realm.Credentials.emailPassword(email, password);
      const newUser = await app.logIn(creds);
      setUser(newUser);
    } catch (err) {
      Alert.alert(
        "An error occured while signing in",
        JSON.stringify(err, null, 2)
      );
      throw `An error occured while signing in ${JSON.stringify(err, null, 2)}`;
    }
  };

  // The signUp function takes an email and password and uses the
  // emailPassword authentication provider to register the user.
  const signUp = async (email, password) => {
    try {
      await app.emailPasswordAuth.registerUser(email, password);
    } catch (err) {
      Alert.alert(
        "An error occured while signing up",
        JSON.stringify(err, null, 2)
      );
      throw `An error occured while signing up ${JSON.stringify(err, null, 2)}`;
    }
  };

  // The signUp function calls the logOut function on the currently
  // logged in user
  const signOut = () => {
    if (user == null) {
      console.warn("Not logged in, can't log out!");
      return;
    }
    console.log("Logging out...");
    user.logOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        signUp,
        signIn,
        signOut,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// The useAuth hook can be used by components under an AuthProvider to
// access the auth context value.
const useAuth = () => {
  const auth = useContext(AuthContext);
  if (auth == null) {
    throw new Error("useAuth() called outside of a AuthProvider?");
  }
  return auth;
};

export { AuthProvider, useAuth };
