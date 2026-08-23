import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { getToken, removeToken, apiGetMe } from "../services/api";

// ---- Types ----

export interface User {
  id: string;
  name: string;
  email: string;
  role: "elder" | "youth" | null;
  bio: string;
  language: string;
  community: string;
  culturalInterests: string[];
  profileImage: string | null;
}

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type UserAction =
  | { type: "RESTORE_SESSION"; payload: User }
  | { type: "REGISTER"; payload: User }
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "UPDATE_PROFILE"; payload: Partial<User> }
  | { type: "UPDATE_CULTURAL_INTERESTS"; payload: string[] }
  | { type: "SET_LOADING"; payload: boolean };

interface UserContextType extends UserState {
  register: (user: User) => void;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  updateCulturalInterests: (interests: string[]) => void;
}

// ---- Reducer ----

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case "RESTORE_SESSION":
      return {
        currentUser: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case "REGISTER":
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: true,
      };
    case "LOGIN":
      return {
        currentUser: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        currentUser: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "UPDATE_PROFILE":
      if (!state.currentUser) return state;
      return {
        ...state,
        currentUser: { ...state.currentUser, ...action.payload },
      };
    case "UPDATE_CULTURAL_INTERESTS":
      if (!state.currentUser) return state;
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          culturalInterests: action.payload,
        },
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// ---- Context ----

const UserContext = createContext<UserContextType | undefined>(undefined);

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
};

// ---- Provider ----

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await getToken();
        if (!token) {
          dispatch({ type: "SET_LOADING", payload: false });
          return;
        }

        const result = await apiGetMe();
        if (result.success && result.data) {
          dispatch({ type: "RESTORE_SESSION", payload: result.data as User });
        } else {
          await removeToken();
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch {
        await removeToken();
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }
    restoreSession();
  }, []);

  const register = (user: User) => {
    dispatch({ type: "REGISTER", payload: user });
  };

  const login = (user: User) => {
    dispatch({ type: "LOGIN", payload: user });
  };

  const logout = async () => {
    await removeToken();
    dispatch({ type: "LOGOUT" });
  };

  const updateProfile = (data: Partial<User>) => {
    dispatch({ type: "UPDATE_PROFILE", payload: data });
  };

  const updateCulturalInterests = (interests: string[]) => {
    dispatch({ type: "UPDATE_CULTURAL_INTERESTS", payload: interests });
  };

  return (
    <UserContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        updateProfile,
        updateCulturalInterests,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// ---- Hook ----

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
