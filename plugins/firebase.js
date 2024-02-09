import { initializeApp, getApp, getApps } from "firebase/app";
import {
  doc,
  query,
  orderBy,
  where,
  getDoc,
  getDocs,
  getFirestore,
  collection,
  collectionGroup,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  startAfter,
  startAt,
  endAt,
  limit,
  Timestamp,
  serverTimestamp,
  connectFirestoreEmulator,
  limitToLast,
  endBefore,
  increment,
} from "firebase/firestore";

import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";

import {
  signInWithEmailAndPassword,
  getAuth,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInAnonymously,
} from "firebase/auth";

import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  connectStorageEmulator,
} from "firebase/storage";

import { getAnalytics } from "firebase/analytics";

export default (ctx, inject) => {
  if (!getApps().length) {
    initializeApp({
      appId: ctx.$config.FIREBASE_APP_ID,
      apiKey: ctx.$config.FIREBASE_API_KEY,
      authDomain: ctx.$config.FIREBASE_AUTH_DOMAIN,
      projectId: ctx.$config.FIREBASE_PROJECT_ID,
      storageBucket: ctx.$config.FIREBASE_STORAGE_BUCKET,
      measurementId: ctx.$config.FIREBASE_MEASUREMENT_ID,
    });
  }

  const auth = getAuth();
  const db = getFirestore();
  const functions = getFunctions(getApp(), "europe-west1");
  const storage = getStorage();

  if (ctx.$config.FIREBASE_MEASUREMENT_ID) getAnalytics(getApp());

  let useLocalAuthEmulator = false;

  if (ctx.isDev) {
    // connectFunctionsEmulator(functions, "localhost", 5001);
    // connectFirestoreEmulator(db, "localhost", 8080);
    // connectStorageEmulator(storage, "localhost", 9199);
    // useLocalAuthEmulator = true;
    // connectAuthEmulator(auth, "http://localhost:9099");
  }

  const checkUser = async (force) => {
    return new Promise((resolve, reject) => {
      if (ctx.$global.adminUser && !force)
        return resolve(ctx.$global.adminUser);

      auth.onAuthStateChanged(async (user) => {
        if (user) {
          // const idTokenResult = await user.getIdTokenResult();
          const userInDb = await get("adminUsers", user.uid);
          // we are not using this claim anymore.. so, just commenting out for now.
          // user.admin = idTokenResult.claims.admin;

          ctx.$global.adminUser = { ...user, ...userInDb };

          return resolve(ctx.$global.adminUser);
        }
        return resolve();
      });
    });
  };
  const isMagicLink = (url) => {
    return isSignInWithEmailLink(auth, url);
  };

  const signInWithMagicLink = async ({ email, url }) => {
    if (!isSignInWithEmailLink(auth, url)) throw "Is not a valid link";
    await signInWithEmailLink(auth, email, url);
  };

  const loginAnonymously = async () => {
    let { user } = await signInAnonymously(auth);
    ctx.$global.user = user;
    return user;
  };

  const login = async ({ email, password }) => {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    ).catch((error) => {
      console.log(error.code, error.message);

      throw error;
    });

    // we are not using this claim anymore.. so, just commenting out for now.
    // const idTokenResult = await credential.user.getIdTokenResult();
    // credential.user.admin = idTokenResult.claims.admin;

    // ctx.$global.adminUser = credential.user;

    return credential;

    //   await signInAnonymously(auth)
    //     .then((credential) => {
    //       console.log(credential.user);
    //     })
    //     .catch((error) => {
    //       console.log(error.code, error.message);
    //     });
  };
  const logout = async () => {
    signOut(auth)
      .then((credential) => {
        ctx.$global.adminUser = null;
      })
      .catch((error) => {
        console.log(error.code, error.message);
      });
    //   await signInAnonymously(auth)
    //     .then((credential) => {
    //       console.log(credential.user);
    //     })
    //     .catch((error) => {
    //       console.log(error.code, error.message);
    //     });
  };

  const subscriptions = {};

  /**
   *
   * @param {object} collectionName the collection name to list for changes
   * @param {string} field The field to be used to store the data in the global plugin
   * @param {string} id Optional, once is provided the subscription will be for this specific document.
   * @param {array} conditions Optional. it could be an Array or an Object of values want to add as And condition
   * @param {object} options Optional. used to limit the result set, order or do really simple pagination.
   *
   * @example $firebase.subscribe({ collectionName: "settings", field: "settings", id: "1" });
   * It will store on global.settings the document with id = 1 and watch for changes
   *
   * $firebase.subscribe({ collectionName: "settings", field: "settings" });
   * It will store on global.settings the array of all documents of the collection settings, and watch for any changes on it
   *
   *
   * $firebase.subscribe({ collectionName: "settings", field: "settings", conditions: [ ["name", "==", "test"] ] });
   * It will store on global.settings the array of all documents that match with name == test, and watch for any changes with these conditions
   *
   */
  const subscribe = ({
    collectionName,
    field,
    id,
    conditions,
    options = {},
    handler,
  }) => {
    if (!collectionName) throw "collectionName must be provided!";
    if (!field) field = collectionName;

    let queryConstraints = [];
    let qry;

    if (id) {
      qry = doc(db, collectionName, String(id));
    } else {
      const reference = collection(db, collectionName);

      let _orderByFields = [{ field: "createdAt", direction: "asc" }];

      if (options.orderBy) {
        _orderByFields = options.orderBy;
        if (!Array.isArray(options.orderBy)) _orderByFields = [options.orderBy];
      }
      _orderByFields.forEach(({ field, direction }) => {
        queryConstraints.push(orderBy(field, direction));
      });
      if (conditions) {
        if (Array.isArray(conditions) && conditions.length > 0) {
          queryConstraints = conditions.map((parameter) => {
            const [key, operation, value] = parameter;
            return where(key, operation, value);
          });
        } else {
          queryConstraints = Object.keys(conditions).map((key) => {
            let operation = "==";
            if (Array.isArray(conditions[key]))
              operation = "array-contains-any";

            return where(key, operation, conditions[key]);
          });
        }
      }

      if (options.limit) {
        // queryConstraints.push(orderBy(options.orderBy || "createdAt"));
        if (!options.last && !options.first)
          queryConstraints.push(limit(options.limit));

        if (options.last && !options.first) {
          queryConstraints.push(startAfter(options.last));
          queryConstraints.push(limit(options.limit));
        } else if (options.first) {
          queryConstraints.push(endBefore(options.first));
          queryConstraints.push(limitToLast(options.limit));
        }
      }
      qry = query(reference, ...queryConstraints);
    }

    const snapshotOpts = { includeMetadataChanges: true };
    try {
      const snapshot = onSnapshot(qry, snapshotOpts, (data) => {
        if (data.metadata.hasPendingWrites) return;
        const items = [];
        if (!!data.docs) {
          data.forEach((item) => {
            const parsedItem = parseObjectFromFirebase(item);
            items.push(parsedItem);
          });

          if (handler) handler(items);
          else ctx.$global[field] = items;
        } else {
          if ((data && !data.data) || (data && data.data && data.data())) {
            const parsedItem = parseObjectFromFirebase(data);

            if (!parsedItem.empty) {
              if (handler) handler(parsedItem);
              else ctx.$global[field] = parsedItem;
            }
          }
        }
      });

      if (handler) return snapshot;
      else subscriptions[field] = snapshot;
    } catch (err) {
      console.log("error subscribing ", err);
    }
  };

  /**
   * Unsubscribe from the given collection
   * @param {string} collectionName the collection name
   */
  const unsubscribe = (collectionName) => {
    if (subscriptions[collectionName]) {
      subscriptions[collectionName]();
    }
  };

  /**
   * Verify if exists subscription with the name provided
   * @param {string} subscriptionName The stored subscription
   * @returns Returns whether or not the subscription exists. True if exists.
   */
  const checkSubscription = (subscriptionName) => {
    return !!subscriptions[subscriptionName];
  };

  const sendMailPasswordReset = async (email) => {
    return sendPasswordResetEmail(auth, email);
  };
  const changePassword = async (newPassword) => {
    await updatePassword(auth.currentUser, newPassword);
  };

  const bulkData = async (model, data) => {
    const execute = httpsCallable(functions, `bulk_${model}`);

    const obj = {
      [model]: data,
    };

    const result = await execute(obj).catch((err) =>
      console.log(`error execute bulking `, err)
    );
    return result;
  };

  const downloadCSV = async (params) => {
    const execute = httpsCallable(functions, `downloadCSV`);
    const result = await execute(params).catch((err) => console.log(err));
    return result;
  };

  const add = async (model, data, id) => {
    try {
      const parsedData = parseObjectToFirebase(data);
      parsedData.createdAt = serverTimestamp();
      parsedData.updatedAt = serverTimestamp();
      let ref;
      if (id) ref = doc(db, model, String(id));
      else ref = doc(collection(db, model));
      parsedData.id = ref.id;
      await setDoc(ref, parsedData);

      return ref;
    } catch (e) {
      console.error("Error adding document: ", e);
      throw e;
    }
  };

  const updateById = async (model, id, data) => {
    try {
      // console.log("updating ", model, id, data);
      const parsedData = parseObjectToFirebase(data);
      parsedData.updatedAt = serverTimestamp();
      const docRef = doc(db, model, String(id));
      await setDoc(docRef, parsedData, { merge: true });
      return parseObjectFromFirebase(docRef);
    } catch (e) {
      console.error("Error updating document: ", e.toString());
      throw e;
    }
  };
  const update = async (model, id, data) => {
    try {
      const parsedData = parseObjectToFirebase(data);
      parsedData.updatedAt = serverTimestamp();

      const docRef = doc(db, model, String(id));
      await setDoc(docRef, parsedData, { merge: true });

      return parseObjectFromFirebase(docRef);
    } catch (e) {
      console.error("Error updating document: ", e.toString());
      throw e;
    }
  };
  const findById = async (model, id) => {
    const ref = doc(db, model, String(id));
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      const data = parseObjectFromFirebase(docSnap);
      return data;
    } else {
      console.log("Document not found!");
      return null;
    }
  };
  const get = async (model, id) => {
    const ref = doc(db, model, String(id).trim());
    const docSnap = await getDoc(ref);

    if (docSnap.exists()) {
      const data = parseObjectFromFirebase(docSnap);
      return data;
    } else {
      console.log("Document not found!");
      return null;
    }
  };
  const parseObjectToFirebase = (object) => {
    if (object.date) {
      let date = object.date;
      if (typeof object.date === "string") date = new Date(object.date);
      if (
        object.show &&
        object.show.date &&
        typeof object.show.date === "string"
      ) {
        try {
          object.show.date = new Date(object.show.date);
          object.show.date = Timestamp.fromDate(object.show.date);
        } catch {}
      }

      object.date = Timestamp.fromDate(date);
    }

    try {
      if (object.createdAt)
        object.createdAt = Timestamp.fromDate(object.createdAt);
    } catch {}
    try {
      if (object.updatedAt)
        object.updatedAt = Timestamp.fromDate(object.updatedAt);
    } catch {}
    try {
      if (object.liveAt) object.liveAt = Timestamp.fromDate(object.liveAt);
    } catch {}
    try {
      if (object.spinAt) object.spinAt = Timestamp.fromDate(object.spinAt);
    } catch {}

    try {
      if (object.expires) {
        if (typeof object.expires === "string") {
          object.expires = Timestamp.fromDate(new Date(object.expires));
        } else object.expires = Timestamp.fromDate(object.expires);
      }
    } catch {}

    if (object.show && object.show.date)
      object.show.date = Timestamp.fromDate(object.show.date);

    return object;
  };
  const parseObjectFromFirebase = (ref) => {
    let object;
    if (ref.data) {
      object = ref.data();
      object.id = ref.id;
    } else {
      object = ref;
    }

    if (object.date) object.date = object.date.toDate();
    if (object.createdAt) object.createdAt = object.createdAt.toDate();
    if (object.updatedAt) object.updatedAt = object.updatedAt.toDate();
    if (object.expires) object.expires = object.expires.toDate();
    if (object.liveAt) object.liveAt = object.liveAt.toDate();
    if (object.spinAt) object.spinAt = object.spinAt.toDate();

    try {
      if (object.show && object.show.date)
        object.show.date = object.show.date.toDate();
    } catch (error) {}

    return object;
  };

  const list = async (model, params, options = {}) => {
    try {
      let queryConstraints = [];

      let _orderByFields = [{ field: "createdAt", direction: "asc" }];

      if (options.orderBy) {
        _orderByFields = options.orderBy;
        if (!Array.isArray(options.orderBy)) _orderByFields = [options.orderBy];
      }
      _orderByFields.forEach(({ field, direction }) => {
        queryConstraints.push(orderBy(field, direction));
      });

      if (params) {
        if (Array.isArray(params) && params.length > 0) {
          queryConstraints = queryConstraints.concat(
            params.map((parameter) => {
              const [key, operation, value] = parameter;
              return where(key, operation, value);
            })
          );
        } else {
          queryConstraints = queryConstraints.concat(
            Object.keys(params).map((key) => {
              let operation = "==";
              if (Array.isArray(params[key])) operation = "array-contains-any";

              return where(key, operation, params[key]);
            })
          );
        }
      }

      if (options.limit) {
        if (!options.first && !options.last)
          queryConstraints.push(limit(options.limit));

        if (options.last) {
          queryConstraints.push(startAfter(options.last));
          queryConstraints.push(limit(options.limit));
        } else if (options.first) {
          queryConstraints.push(endBefore(options.first));
          queryConstraints.push(limitToLast(options.limit));
        }
      }
      // console.log(JSON.stringify(queryConstraints, null, 2));
      const ref = collection(db, model);

      const querySnapshot = await getDocs(query(ref, ...queryConstraints));
      const parsedList = querySnapshot
        ? querySnapshot.docs.map((item) => {
            const data = parseObjectFromFirebase(item);
            return data;
          })
        : [];

      return parsedList;
    } catch (e) {
      console.log("Error listing data", e);
      throw e;
    }
  };

  const listOR = async (model, params, options = {}) => {
    if (!(Array.isArray(params) && params.length > 0)) return [];

    try {
      const promises = params.map(async (parameter) => {
        let items = await list(model, [parameter], options);
        return items;
      });

      const result = await (
        await Promise.all(promises)
      ).reduce((prev, cur) => {
        if (!prev) prev = [];

        prev = prev.concat(cur);
        return prev;
      }, []);

      return result;
    } catch (e) {
      console.log("Error listing [OR] data", e);
      throw e;
    }
  };

  const listIn = async (model, field, values) => {
    let valuesCopy = [...values];
    let batches = [];
    while (valuesCopy.length)
      batches.push([field, "in", valuesCopy.splice(0, 10)]);
    return await listOR(model, batches);
  };

  const removeById = async (model, id) => {
    await deleteDoc(doc(db, model, id));
  };

  const genericFunction = async (fn_name, ...params) => {
    try {
      const { data } = await httpsCallable(functions, fn_name)(...params);
      return data;
    } catch (err) {
      console.log("error calling generic function", err);
      throw err;
    }
  };

  return inject("firebase", {
    sendMailPasswordReset,
    checkUser,
    login,
    loginAnonymously,
    logout,
    add,
    update,
    updateById,
    get,
    findById,
    list,
    removeById,
    unsubscribe,
    checkSubscription,
    subscribe,
    bulkData,
    downloadCSV,
    genericFunction,
    listOR,
    listIn,
    isMagicLink,
    signInWithMagicLink,
    changePassword,

    util: {
      Timestamp,
      serverTimestamp,
      increment,
    },
  });
};
