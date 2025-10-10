import { di } from '../dependencyInjector';
// import { EventsStream } from '../modules/EventsStream';
import { Callbacks } from '../Callbacks';
import { helpers } from '../../helpers';
import { log } from '../log';
import { browser } from '../../browser';
import { objectHelpers } from '../../helpers/ObjectHelpers';
import { EventsStream } from '../EventsStream';
import { FireProxy } from './FireProxy';
import { Firebase, IFirebaseInstance } from './FirebaseModule';
import { LocalStorageMock } from '../LocalStorageMock';

// Firebase Modular SDK - Auth imports
import {
    getAuth,
    onAuthStateChanged,
    signInWithPopup,
    signOut as fbSignOut,
    signInAnonymously as fbSignInAnonymously,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    linkWithPopup,
    linkWithCredential,
    GoogleAuthProvider,
    GithubAuthProvider,
    FacebookAuthProvider,
    EmailAuthProvider,
    getIdToken,
    type Auth,
    type User as FirebaseUser,
} from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';

let localStorage = LocalStorageMock.safeGetLocalStorage();

export class UserManager {
    public firebaseModule: Firebase;
    public firebaseApp: FirebaseApp;
    public auth: Auth;
    // public profile: any = {};
    public data: IBasicUser = null;

    public onSignIn = new Callbacks();
    public onSignOut = new Callbacks();
    public onStatusChanged = new Callbacks();
    public onDataChanged = new Callbacks();
    public onProfileChanged = new Callbacks();
    public onReady = new Callbacks<IBasicUser>();

    public events = new EventsStream();
    public ready: boolean;
    private _fbUser: FirebaseUser;
    private token: string;
    private dataProxy: FireProxy<IBasicUser> = null;
    private _options = new Options();
    private isInitiated = false;

    public constructor(firebaseModule: Firebase) {
        this.firebaseModule = firebaseModule;
        this.firebaseApp = firebaseModule.firebaseApp;
        this.auth = getAuth(this.firebaseApp);

        if (!this.auth) {
            throw new Error('Firebase Auth is not defined. Did you import "firebase/auth"?');
        }

        // this.events.emit({ step: 'init' }, 'user');

        // this.onSignIn.subscribe(() => {
        //     this.observeProfile();
        //     this.observeUser();
        // });

        onAuthStateChanged(this.auth, this.onAuthStateChanged.bind(this));

        const cachedUserId = localStorage.loggedInUserId;
        if (cachedUserId != null) {
            this.dataProxy = new FireProxy<IBasicUser>(this.firebaseModule, '/users/' + cachedUserId, null, {
                isCachedProxy: this._options.isCacheProfile,
            });
            log.verbose('userManager:ctor: detected cached userId, will try to load cached data');
            this.data = this.dataProxy.proxy;
            log.d('userManager:ctor: cached data: ', this.data);
            setTimeout(() => this.onReady.trigger(this.data), 10);
        }
    }

    //#region Signin methods
    public async signInGoogle(customScopes?: string): Promise<void> {
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        provider.setCustomParameters({ prompt: 'select_account' });

        if (customScopes != null) {
            customScopes.split(',').forEach((scope) => provider.addScope(scope));
        }

        try {
            if (this.auth.currentUser?.isAnonymous) {
                await linkWithPopup(this.auth.currentUser, provider);
            } else {
                await signInWithPopup(this.auth, provider);
            }
        } catch (ex) {
            throw ex;
        }
    }

    public async signInGithub(): Promise<void> {
        const provider = new GithubAuthProvider();

        try {
            if (this.auth.currentUser?.isAnonymous) {
                await linkWithPopup(this.auth.currentUser, provider);
            } else {
                await signInWithPopup(this.auth, provider);
            }
        } catch (ex) {
            throw ex;
        }
    }

    public async signInAnon(displayName: string): Promise<void> {
        try {
            const result = await fbSignInAnonymously(this.auth);
            log.verbose(' > app:user: Got anon user', result.user);
            this.onSignIn.once(() => {
                this.data.public.displayName = displayName;
            });
        } catch (error) {
            log.verbose(' ! app:user: Failed to get anon user', error);
            throw error;
        }
    }

    public async signInFacebook(): Promise<void> {
        const provider = new FacebookAuthProvider();
        provider.addScope('email');
        provider.addScope('public_profile');
        // provider.addScope("user_about_me");
        // provider.addScope("user_friends");

        provider.setCustomParameters({ display: 'popup' });

        try {
            if (this.auth.currentUser?.isAnonymous) {
                await linkWithPopup(this.auth.currentUser, provider);
            } else {
                await signInWithPopup(this.auth, provider);
            }
        } catch (ex) {
            throw ex;
        }
    }

    public async signUpEmail(email: string, password: string): Promise<void> {
        try {
            await createUserWithEmailAndPassword(this.auth, email, password);
        } catch (error) {
            log.error('app:user:signUpEmail: Error- ', error);
            throw error;
        }
    }

    public async signInEmail(email: string, password: string): Promise<FirebaseUser | void> {
        if (this.auth.currentUser?.isAnonymous) {
            const credential = EmailAuthProvider.credential(email, password);
            try {
                const result = await linkWithCredential(this.auth.currentUser, credential);
                log.verbose('Account linking success', result.user);
                await this.onAuthStateChanged(result.user);
                return result.user;
            } catch (error) {
                log.verbose('Account linking error', error);
                throw error;
            }
        }

        try {
            await signInWithEmailAndPassword(this.auth, email, password);
        } catch (error) {
            log.verbose(' ! app:user:signInEmail: Error- ', error);
            throw error;
        }
    }
    //#endregion

    public isSignedIn() {
        return this.auth.currentUser != null;
    }

    public isReady() {
        return this.ready;
    }

    public async signOut(): Promise<void> {
        // Sign out of Firebase.
        await fbSignOut(this.auth);

        browser.helpers.reload();
    }

    public async refreshToken(): Promise<string> {
        log.debug('userManager:refreshToken: ');

        this.token = await getIdToken(this._fbUser, true);

        return this.token;
    }

    public async onAuthStateChanged(user) {
        log.debug('userManager:onAuthStateChanged: ', user);

        this.ready = true;
        this._fbUser = user;

        this.onStatusChanged.trigger(user);

        if (user == null) {
            this.data = null;
            this.onSignOut.trigger(this.data);
            this.events.emit({ step: 'signed-out' }, 'user');
            delete localStorage.loggedInUserId;
            this.onReady.trigger(null);
            return;
        }

        // await this.refreshToken();

        const obj = <IBasicUser>{
            public: {},
            private: {},
        };
        this.dataProxy = new FireProxy<IBasicUser>(this.firebaseModule, '/users/' + user.uid, obj, {
            isCachedProxy: this._options.isCacheProfile,
        });
        this.data = this.dataProxy.proxy;
        this.dataProxy.init();
        this.dataProxy.onChange.subscribe((data) => {
            this.onDataChanged?.trigger(data);

            if (!this.isInitiated) {
                this.onReady.trigger(this.data);
                this.isInitiated = true;
            }
        });

        this.dataProxy.skip(() => {
            if (!user.isAnonymous) {
                this.data.public.profilePicUrl = user.photoURL || user.providerData[0]?.photoURL;
                this.data.public.lastLoginAt = user.lastLoginAt;
                this.data.private.email = user.email || user.providerData[0]?.email;
                this.data.private.phoneNumber = user.phoneNumber || user.providerData[0]?.phoneNumber;
            }
            this.data.public.id = user.uid;
            this.data.public.displayName = user.displayName;
            this.data.public.isAnonymous = user.isAnonymous;
        }, false); //!objectHelpers.isEmptyObject(curVal));

        localStorage.loggedInUserId = user.uid;

        this.events.emit({ step: 'signed-in' }, 'user');
        this.onSignIn.trigger(this.data);
    }
}

export class Options {
    isCacheProfile = false;
}

export interface IBasicUser {
    public: {
        id: string;
        profilePicUrl: string;
        displayName: string;
        lastLoginAt: number;
        isAnonymous: boolean;
    };
    private: {
        email: string;
        phoneNumber: string;
        loginMethod: string;
    };
}

di.register('UserManager', UserManager);
