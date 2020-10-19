import { di } from './dependencyInjector';
// import { EventsStream } from '../modules/EventsStream';
import { Callbacks } from './Callbacks';
import { helpers } from '../helpers';
import { log } from './log';
import { browser } from '../browser';

export class UserManager {
    public firebaseModule;
    public firebase;
    public auth;
    public profile: any = {};
    public data: any = null;

    public onSignIn = new Callbacks();
    public onSignOut = new Callbacks();
    public onStatusChanged = new Callbacks();
    public onDataChanged = new Callbacks();
    public onProfileChanged = new Callbacks();

    // public events = new EventsStream();

    public constructor(firebaseModule) {
        this.firebaseModule = firebaseModule;
        this.firebase = firebaseModule.firebaseApp;
        this.auth = this.firebase.auth();

        // this.events.broadcast({ step: 'init' }, 'user');

        this.onSignIn.subscribe(() => {
            this.observeProfile();
            this.observeUser();
        });

        this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
    }

    //#region Signin methods
    public signInGoogle = async () => {
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
    };

    public signInGithub = async () => {
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
    };

    public signInAnon = async (displayName) => {
        let p = helpers.newPromise();
        if (this.data == null) this.data = {};

        if (this.profile == null) this.profile = {};
        this.profile.displayName = displayName;
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
    };

    public signInFacebook = async () => {
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
    };

    public signUpEmail = async (email, password) => {
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
    };

    public signInEmail = async (email, password) => {
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
    };
    //#endregion

    public isSignedIn = function () {
        return this.auth.currentUser != null;
    };

    public signOut = async function () {
        // Sign out of Firebase.
        await this.auth.signOut();

        browser.helpers.reload();
    };

    public refreshToken = async function () {
        log.debug('userManager:refreshToken: ');

        this.token = await this._fbUser.getIdToken();

        return this.token;
    };

    public onAuthStateChanged = async function (user) {
        log.debug('userManager:onAuthStateChanged: ', user);

        this.isReady = true;
        this._fbUser = user;

        this.onStatusChanged.trigger(user);

        if (!user) {
            this.data = null;
            this.onSignOut.trigger(this.data);
            this.events.broadcast({ step: 'signed-out' }, 'user');
            return;
        }

        // await this.refreshToken();

        if (this.data == null) this.data = {};

        if (!user.isAnonymous) {
            var obj = {
                profilePicUrl: user.photoURL,
                email: user.email,
            };
            helpers.ObjectHelpers.merge(this.data, obj);
        }
        this.data.isAnonymous = user.isAnonymous;
        this.data.id = user.uid;
        this.writeData();
        this.observeUser();

        this.events.broadcast({ step: 'signed-in' }, 'user');
        this.onSignIn.trigger(this.data);
    };

    public observeUser = function () {
        return this.firebaseModule.listen('/users/' + this.data.id, (data) => {
            if (data != null && data.length == 1) data = data[0];
            log.verbose('> user: user data changed', data);
            helpers.ObjectHelpers.merge(this.data, data);
            this.events.broadcast({ step: 'user-updated' }, 'user');
            this.onDataChanged.trigger(this.data);
        });
    };

    public observeProfile = function () {
        return this.firebaseModule.listen('/profiles/' + this.data.id, (data) => {
            if (data != null && data.length == 1) data = data[0];
            log.verbose('> user: profile data changed', data);

            helpers.ObjectHelpers.merge(this.profile, data);

            if (helpers.ObjectHelpers.isEmpty(this.profile)) {
                log.verbose('> user: profile is empty, taking from user object (login)');
                this.profile = {};
                this.profile.email = this.data.email;
                if (this.auth.currentUser.displayName != null) this.profile.displayName = this.auth.currentUser.displayName;
                else if (this.data.displayName != null) this.profile.displayName = this.data.displayName;
                this.profile.profilePicUrl = this.data.profilePicUrl;
            }

            this.events.broadcast({ step: 'profile-updated' }, 'user');
            this.onProfileChanged.trigger(this.profile);
        });
    };

    public writeData = function () {
        let p1 = this.firebaseModule.update('/users/' + this.data.id, this.data);
        let p2 = this.firebaseModule.update('/profiles/' + this.data.id, this.profile);
        this.events.broadcast({ step: 'wrote-data' }, 'user');

        Promise.all([p1, p2]);

        return;
    };

    // if ($rootScope.app == null) $rootScope.app = {};
    // $rootScope.mod = mod;
    // $rootScope.$on('fib-ready', function () {
    // 	this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
    // });
}

di.register('UserManager', module.exports);
