// This is a mock DB service using localStorage.
// In a real application, this would be replaced with API calls to a proper backend database.

const DB_KEY = 'myhealthpath_db';

interface User {
    email: string;
    password_hash: string; // In a real app, this would be a securely hashed password.
}

export interface UserData {
    profile?: any;
    goals?: any;
    logs?: any[];
    calories?: any;
    customFoods?: any[];
    definedMetrics?: any[];
}

interface Database {
    users: User[];
    userData: Record<string, UserData>;
}

const getDb = (): Database => {
    if (typeof window === 'undefined') {
        return { users: [], userData: {} };
    }
    const dbString = localStorage.getItem(DB_KEY);
    if (!dbString) {
        return { users: [], userData: {} };
    }
    try {
        return JSON.parse(dbString);
    } catch (e) {
        console.error("Failed to parse DB from localStorage", e);
        return { users: [], userData: {} };
    }
}

const saveDb = (db: Database) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// --- Auth Functions ---

export const signUp = (email: string, pass: string) => {
    const db = getDb();
    const userExists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
        throw new Error("User with this email already exists.");
    }
    
    // NOTE: Storing plain text password for prototype. DO NOT DO THIS IN PRODUCTION.
    db.users.push({ email: email.toLowerCase(), password_hash: pass });
    db.userData[email.toLowerCase()] = {}; // Initialize user data
    
    saveDb(db);
};

export const logIn = (email: string, pass: string): { email: string } => {
    const db = getDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        throw new Error("Invalid email or password.");
    }

    // NOTE: Comparing plain text password for prototype. DO NOT DO THIS IN PRODUCTION.
    if (user.password_hash !== pass) {
        throw new Error("Invalid email or password.");
    }

    return { email: user.email };
};


// --- Data Functions ---

export const getUserData = (email: string): UserData => {
    const db = getDb();
    return db.userData[email.toLowerCase()] || {};
}

type DataType = keyof UserData;

export const saveUserData = (email: string, data: Partial<UserData>) => {
    if(!email) return;
    const db = getDb();
    const lowercasedEmail = email.toLowerCase();
    
    if (!db.userData[lowercasedEmail]) {
        db.userData[lowercasedEmail] = {};
    }

    db.userData[lowercasedEmail] = {
        ...db.userData[lowercasedEmail],
        ...data
    };
    
    saveDb(db);
}
