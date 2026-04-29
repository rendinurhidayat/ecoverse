import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserProfile, EcosystemSave, QuizQuestion, LabState, Flashcard, StoryProgress, QuizResult } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

export const subscribeToUserProfile = (uid: string, callback: (profile: UserProfile | null) => void) => {
  const userRef = doc(db, 'users', uid);
  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as UserProfile);
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  });
};

export const subscribeToSaves = (uid: string, callback: (saves: EcosystemSave[]) => void) => {
  const q = query(collection(db, 'saves'), where('uid', '==', uid));
  return onSnapshot(q, (snapshot) => {
    const saves = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as EcosystemSave));
    callback(saves);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'saves');
  });
};

export const subscribeToQuizzes = (callback: (quizzes: QuizQuestion[]) => void) => {
  return onSnapshot(collection(db, 'quizzes'), (snapshot) => {
    const quizzes = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuizQuestion));
    callback(quizzes);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'quizzes');
  });
};

export const subscribeToLabState = (uid: string, labId: string, callback: (state: LabState | null) => void) => {
  const q = query(collection(db, 'labs'), where('uid', '==', uid), where('labId', '==', labId));
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      callback({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as LabState);
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'labs');
  });
};

export const subscribeToMaterials = (callback: (materials: Flashcard[]) => void) => {
  return onSnapshot(collection(db, 'materials'), (snapshot) => {
    const materials = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Flashcard));
    callback(materials);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'materials');
  });
};

export const subscribeToLeaderboard = (date: string, callback: (results: QuizResult[]) => void) => {
  const q = query(collection(db, 'quizResults'), where('date', '==', date));
  return onSnapshot(q, (snapshot) => {
    const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuizResult));
    callback(results.sort((a, b) => b.score - a.score).slice(0, 10));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'quizResults');
  });
};

export const subscribeToStoryProgress = (uid: string, callback: (progress: StoryProgress | null) => void) => {
  const q = query(collection(db, 'storyProgress'), where('uid', '==', uid));
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      callback({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as StoryProgress);
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'storyProgress');
  });
};

export const updateUserXP = async (uid: string, xpToAdd: number) => {
  try {
    const profile = await getUserProfile(uid);
    if (!profile) return;

    const newXp = (profile.xp || 0) + xpToAdd;
    // Standard level up formula: Level = Math.floor(totalXp / 1000) + 1
    const newLevel = Math.floor(newXp / 1000) + 1;
    
    const updatedProfile = {
      xp: newXp,
      level: newLevel,
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, 'users', uid), updatedProfile);
    return { ...profile, ...updatedProfile };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return await getUserProfile(uid);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
};

export const updateChallengeProgress = async (uid: string, challengeId: string, progress: number) => {
  try {
    const profile = await getUserProfile(uid);
    if (!profile) return;

    const currentProgress = profile.challengeProgress || {};
    const updatedProgress = {
      ...currentProgress,
      [challengeId]: progress
    };

    await updateDoc(doc(db, 'users', uid), {
      challengeProgress: updatedProgress,
      updatedAt: serverTimestamp()
    });
    return { ...profile, challengeProgress: updatedProgress };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
};

export const saveUserProfile = async (profile: UserProfile) => {
  try {
    const userRef = doc(db, 'users', profile.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      await updateDoc(userRef, {
        ...profile,
        updatedAt: serverTimestamp()
      });
    } else {
      await setDoc(userRef, {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${profile.uid}`);
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return null;
  }
};

export const saveEcosystem = async (save: EcosystemSave) => {
  const { id, ...data } = save;
  const path = id ? `saves/${id}` : 'saves';
  try {
    if (id) {
      await updateDoc(doc(db, 'saves', id), { ...data, updatedAt: serverTimestamp() });
      return id;
    } else {
      const docRef = await addDoc(collection(db, 'saves'), { ...data, createdAt: serverTimestamp() });
      return docRef.id;
    }
  } catch (error) {
    handleFirestoreError(error, id ? OperationType.UPDATE : OperationType.CREATE, path);
  }
};

export const getSaves = async (uid: string): Promise<EcosystemSave[]> => {
  try {
    const q = query(collection(db, 'saves'), where('uid', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as EcosystemSave));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'saves');
    return [];
  }
};

export const getQuizzes = async (): Promise<QuizQuestion[]> => {
  try {
    const snap = await getDocs(collection(db, 'quizzes'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as QuizQuestion));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'quizzes');
    return [];
  }
};

export const addQuiz = async (quiz: Partial<QuizQuestion>) => {
  try {
    await addDoc(collection(db, 'quizzes'), quiz);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'quizzes');
  }
};

export const getLabState = async (uid: string, labId: string): Promise<LabState | null> => {
  try {
    const q = query(collection(db, 'labs'), where('uid', '==', uid), where('labId', '==', labId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as LabState;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'labs');
    return null;
  }
};

export const saveLabState = async (state: LabState) => {
  const { id, ...data } = state;
  try {
    if (id) {
      await updateDoc(doc(db, 'labs', id), { ...data, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, 'labs'), { ...data, updatedAt: serverTimestamp() });
    }
  } catch (error) {
    handleFirestoreError(error, id ? OperationType.UPDATE : OperationType.CREATE, id ? `labs/${id}` : 'labs');
  }
};

export const getMaterials = async (): Promise<Flashcard[]> => {
  try {
    const snap = await getDocs(collection(db, 'materials'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Flashcard));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'materials');
    return [];
  }
};

export const saveMaterial = async (material: Partial<Flashcard>) => {
  const { id, ...data } = material as any;
  try {
    if (id) {
      await updateDoc(doc(db, 'materials', id), { ...data, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, 'materials'), { ...data, createdAt: serverTimestamp(), createdBy: auth.currentUser?.uid });
    }
  } catch (error) {
    handleFirestoreError(error, id ? OperationType.UPDATE : OperationType.CREATE, id ? `materials/${id}` : 'materials');
  }
};

export const deleteMaterial = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'materials', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `materials/${id}`);
  }
};

export const saveStoryProgress = async (progress: StoryProgress) => {
  try {
    const q = query(collection(db, 'storyProgress'), where('uid', '==', progress.uid));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      const docId = snap.docs[0].id;
      await updateDoc(doc(db, 'storyProgress', docId), {
        ...progress,
        updatedAt: serverTimestamp()
      });
    } else {
      await addDoc(collection(db, 'storyProgress'), {
        ...progress,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'storyProgress');
  }
};

export const getStoryProgress = async (uid: string): Promise<StoryProgress | null> => {
  try {
    const q = query(collection(db, 'storyProgress'), where('uid', '==', uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as StoryProgress;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'storyProgress');
    return null;
  }
};

export const saveQuizResult = async (result: QuizResult) => {
  try {
    const { id, ...data } = result;
    await addDoc(collection(db, 'quizResults'), {
      ...data,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'quizResults');
  }
};

export const getDailyLeaderboard = async (date: string): Promise<QuizResult[]> => {
  try {
    const q = query(
      collection(db, 'quizResults'), 
      where('date', '==', date)
      // Note: Ordering might require an index, but for small datasets we can sort in memory if needed
      // or just use query ordering if the user has deployed indexes.
      // query(..., orderBy('score', 'desc'), limit(10))
    );
    const snap = await getDocs(q);
    const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as QuizResult));
    return results.sort((a, b) => b.score - a.score).slice(0, 10);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'quizResults');
    return [];
  }
};
