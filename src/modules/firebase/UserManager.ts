import { di } from '../dependencyInjector';
// import { EventsStream } from '../modules/EventsStream';
import { Callbacks } from '../Callbacks';
import { helpers } from '../../helpers';
import { log } from '../log';
import { browser } from '../../browser';
import { objectHelpers } from '../../helpers/ObjectHelpers';
import { EventsStream } from '../EventsStream';
import { FireProxy } from './FireProxy';
import { Firebase, IFirebaseInstance } from './Firebase';

export class UserManager {
    public firebaseModule: Firebase;
    public firebase: IFirebaseInstance;
    public auth;
    // public profile: any = {};
    public data: IBasicUser = null;

    public onSignIn = new Callbacks();
    public onSignOut = new Callbacks();
    public onStatusChanged = new Callbacks();
    public onDataChanged = new Callbacks();
    public onProfileChanged = new Callbacks();
    public onReady = new Callbacks<IBasicUser>();

    public events = new EventsStream();
    public isReady: boolean;
    private _fbUser: any;
    private token: any;
    private dataProxy: FireProxy<IBasicUser> = null;

    public constructor(firebaseModule: Firebase) {
        this.firebaseModule = firebaseModule;
        this.firebase = firebaseModule.firebaseApp;
        if (this.firebase.auth == null) throw new Error('Firebase.Auth is not defined. Did you import "firebase-auth" package?');
        this.auth = this.firebase.auth();

        // this.events.broadcast({ step: 'init' }, 'user');

        // this.onSignIn.subscribe(() => {
        //     this.observeProfile();
        //     this.observeUser();
        // });

        this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));

        const cachedUserId = localStorage.loggedInUserId;
        if (cachedUserId != null) {
            this.dataProxy = new FireProxy<IBasicUser>(this.firebaseModule, '/users/' + cachedUserId, null, { isCachedProxy: true });
            log.verbose('userManager:ctor: detected cached userId, will try to load cached data');
            this.data = this.dataProxy.proxy;
            log.d('userManager:ctor: cached data: ', this.data);
            setTimeout(() => this.onReady.trigger(this.data), 10);
        }
    }

    //#region Signin methods
    public async signInGoogle() {
        let p = helpers.newPromise();
        // Sign in Firebase using popup auth and Google as the identity provider.
        var provider = new this.firebaseModule.firebaseProvider.auth.GoogleAuthProvider();

        if (this.auth.currentUser != null && this.auth.currentUser.isAnonymous)
            this.auth.currentUser
                .linkWithPopup(provider)
                .then(() => p.resolve())
                .catch((ex) => p.reject(ex));
        else
            this.auth
                .signInWithPopup(provider)
                .then(() => p.resolve())
                .catch((ex) => p.reject(ex));
        return p;
    }

    public async signInGithub() {
        let p = helpers.newPromise();
        // Sign in Firebase using popup auth and Google as the identity provider.
        var provider = new this.firebaseModule.firebaseProvider.auth.GithubAuthProvider();

        if (this.auth.currentUser != null && this.auth.currentUser.isAnonymous)
            this.auth.currentUser
                .linkWithPopup(provider)
                .then(() => p.resolve())
                .catch((ex) => p.reject(ex));
        else
            this.auth
                .signInWithPopup(provider)
                .then(() => p.resolve())
                .catch((ex) => p.reject(ex));
        return p;
    }

    public async signInAnon(displayName) {
        let p = helpers.newPromise();
        // if (this.data == null) this.data = {};
        // if (this.profile == null) this.profile = {};

        this.data.public.displayName = displayName;
        this.auth
            .signInAnonymously()
            .then(function (u) {
                log.verbose(' > app:user: Got anon user');
                p.resolve();
            })
            .catch(function (error) {
                log.verbose(' ! app:user: Failed to get anon user', error);
                p.reject(error);
                // var errorCode = error.code;
                // var errorMessage = error.message;
            });
        return p;
    }

    public async signInFacebook() {
        let p = helpers.newPromise();
        // Sign in Firebase using popup auth and Google as the identity provider.
        var provider = new this.firebaseModule.firebaseProvider.auth.FacebookAuthProvider();
        provider.addScope('email');
        provider.addScope('public_profile');
        // provider.addScope("user_about_me");
        // provider.addScope("user_friends");

        provider.setCustomParameters({ display: 'popup' });

        if (this.auth.currentUser != null && this.auth.currentUser.isAnonymous)
            this.auth.currentUser
                .linkWithPopup(provider)
                .then(() => p.resolve())
                .catch((ex) => p.reject(ex));
        else
            this.auth
                .signInWithPopup(provider)
                .then(() => p.resolve())
                .catch((ex) => p.reject(ex));

        return p;
    }

    public async signUpEmail(email, password) {
        let p = helpers.newPromise();
        this.auth
            .createUserWithEmailAndPassword(email, password)
            .then(() => p.resolve())
            .catch(function (error) {
                log.error('app:user:signInEmail: Error- ', error);
                var errorCode = error.code;
                var errorMessage = error.message;
                p.reject(error);
            });
        return p;
    }

    public async signInEmail(email, password) {
        let p = helpers.newPromise();
        if (this.auth.currentUser != null && this.auth.currentUser.isAnonymous) {
            var credential = this.auth.EmailAuthProvider.credential(email, password);
            this.auth.currentUser.linkWithCredential(credential).then(
                function (user) {
                    log.verbose('Account linking success', user);
                    this.onAuthStateChanged(user);
                    p.resolve(user);
                },
                function (error) {
                    log.verbose('Account linking error', error);
                    p.reject(error);
                }
            );
            return;
        }

        this.auth
            .signInWithEmailAndPassword(email, password)
            .then(() => p.resolve())
            .catch(function (error) {
                log.verbose(' ! app:user:signInEmail: Error- ', error);
                p.reject(error);
                var errorCode = error.code;
                var errorMessage = error.message;
            });

        return p;
    }
    //#endregion

    public isSignedIn() {
        return this.auth.currentUser != null;
    }

    public async signOut() {
        // Sign out of Firebase.
        await this.auth.signOut();

        browser.helpers.reload();
    }

    public async refreshToken() {
        log.debug('userManager:refreshToken: ');

        this.token = await this._fbUser.getIdToken();

        return this.token;
    }

    public async onAuthStateChanged(user) {
        log.debug('userManager:onAuthStateChanged: ', user);

        this.isReady = true;
        this._fbUser = user;

        this.onStatusChanged.trigger(user);

        if (!user) {
            this.data = null;
            this.onSignOut.trigger(this.data);
            this.events.broadcast({ step: 'signed-out' }, 'user');
            delete localStorage.loggedInUserId;
            this.onReady.trigger(null);
            return;
        }

        // await this.refreshToken();

        this.events.broadcast({ step: 'signed-in' }, 'user');
        this.onSignIn.trigger(this.data);

        this.dataProxy = new FireProxy<IBasicUser>(this.firebaseModule, '/users/' + user.uid);
        // const curVal = await this.dataProxy.getValueFromDB();
        this.dataProxy.skip(() => {
            this.data = this.dataProxy.proxy;
            if (this.data.public == null) this.data.public = <any>{};
            if (this.data.private == null) this.data.private = <any>{};

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
        this.onReady.trigger(this.data);
    }

    // public async observeUser() {
    //     return this.firebaseModule.listen('/users/' + this.data.id, (data) => {
    //         if (data != null && data.length == 1) data = data[0];
    //         log.verbose('> user: user data changed', data);
    //         objectHelpers.merge(this.data, data);
    //         this.events.broadcast({ step: 'user-updated' }, 'user');
    //         this.onDataChanged.trigger(this.data);
    //     });
    // }

    // public async observeProfile() {
    //     return this.firebaseModule.listen('/profiles/' + this.data.id, (data) => {
    //         if (data != null && data.length == 1) data = data[0];
    //         log.verbose('> user: profile data changed', data);

    //         objectHelpers.merge(this.profile, data);

    //         if (objectHelpers.isEmpty(this.profile)) {
    //             log.verbose('> user: profile is empty, taking from user object (login)');
    //             this.profile = {};
    //             this.profile.email = this.data.email;
    //             if (this.auth.currentUser.displayName != null) this.profile.displayName = this.auth.currentUser.displayName;
    //             else if (this.data.displayName != null) this.profile.displayName = this.data.displayName;
    //             this.profile.profilePicUrl = this.data.profilePicUrl;
    //         }

    //         this.events.broadcast({ step: 'profile-updated' }, 'user');
    //         this.onProfileChanged.trigger(this.profile);
    //     });
    // }

    // public async writeData() {
    //     let p1 = this.firebaseModule.update('/users/' + this.data.id, this.data);
    //     let p2 = this.firebaseModule.update('/profiles/' + this.data.id, this.profile);
    //     this.events.broadcast({ step: 'wrote-data' }, 'user');

    //     Promise.all([p1, p2]);

    //     return;
    // }

    // if ($rootScope.app == null) $rootScope.app = {};
    // $rootScope.mod = mod;
    // $rootScope.$on('fib-ready', function () {
    // 	this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
    // });
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

di.register('UserManager', module.exports);
