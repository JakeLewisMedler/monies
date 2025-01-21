import { initializeApp, getApps } from "firebase/app";

import { signInWithEmailAndPassword, getAuth, signOut, onAuthStateChanged } from "firebase/auth";

export default (ctx, inject) => {
  if (!getApps().length) {
    initializeApp({
      apiKey: "AIzaSyBCtOwdIBjF3Y_QiCueyJnBT0AXZX6lKrA",
      authDomain: "monies-106dc.firebaseapp.com",
      projectId: "monies-106dc",
      storageBucket: "monies-106dc.firebasestorage.app",
      messagingSenderId: "518033444873",
      appId: "1:518033444873:web:bc0c9a988bc0c11fb7e8d8"
    });
  }

  const auth = getAuth();

  const checkUser = async () => {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(auth, async (authUser) => {
        try {
          if (authUser) ctx.$global.user = authUser;
          else ctx.$global.user = null;
          return resolve(ctx.$global.user);
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const login = async ({ email, password }) => {
    console.log("sign in with", email, password);
    const credential = await signInWithEmailAndPassword(auth, email, password).catch((error) => {
      console.log(error.code, error.message);

      throw error;
    });

    return credential;
  };

  const logout = async () => {
    await signOut(auth);
    ctx.$global.user = null;
    console.log("logged out");
  };

  const getIdToken = async () => {
    let token = await auth?.currentUser?.getIdToken();
    return token;
  };

  return inject("firebase", {
    checkUser,
    login,
    logout,
    getIdToken
  });
};
