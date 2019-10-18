module.exports = async function(firebaseModule){
	var mod = {};

	// var libx = __libx;
	// var libx = require('../bundles/browser.essentials');

	var appEvents = null;
	require('../modules/appEvents').then(_appEvents=>{
		appEvents = _appEvents;
	});

	mod.firebaseModule = firebaseModule;
	mod.firebase = firebaseModule.firebaseApp;
	mod.auth = mod.firebase.auth();
	mod.profile = {};

	mod.onSignIn = new libx.Callbacks();
	mod.onSignOut = new libx.Callbacks();
	mod.onStatusChanged = new libx.Callbacks();
	mod.onDataChanged = new libx.Callbacks();
	mod.onProfileChanged = new libx.Callbacks();

	if (appEvents) appEvents.broadcast('user', { step:'init' });

	//#region Signin methods
	mod.signInGoogle = async () => {
		let p = libx.newPromise();
		// Sign in Firebase using popup auth and Google as the identity provider.
		var provider = new mod.firebaseModule.firebaseProvider.auth.GoogleAuthProvider();
		
		if (mod.auth.currentUser != null && mod.auth.currentUser.isAnonymous)
			mod.auth.currentUser.linkWithPopup(provider).then(()=>p.resolve()).catch(ex=>p.reject(ex));
		else
			mod.auth.signInWithPopup(provider).then(()=>p.resolve()).catch(ex=>p.reject(ex));
		return p;
	};

	mod.signInGithub = async () => {
		let p = libx.newPromise();
		// Sign in Firebase using popup auth and Google as the identity provider.
		var provider = new mod.firebaseModule.firebaseProvider.auth.GithubAuthProvider();
		
		if (mod.auth.currentUser != null && mod.auth.currentUser.isAnonymous)
			mod.auth.currentUser.linkWithPopup(provider).then(()=>p.resolve()).catch(ex=>p.reject(ex));
		else
			mod.auth.signInWithPopup(provider).then(()=>p.resolve()).catch(ex=>p.reject(ex));
		return p;
	};

	mod.signInAnon = async (displayName) => {
		let p = libx.newPromise();
		if (mod.data == null) mod.data = {};

		if (mod.profile == null) mod.profile = {};
		mod.profile.displayName = displayName;
		mod.auth.signInAnonymously().then(function (u) {
			libx.log.verbose(' > app:user: Got anon user');
			p.resolve();
		}).catch(function (error) {
			libx.log.verbose(' ! app:user: Failed to get anon user', error);
			p.reject(error);
			// var errorCode = error.code;
			// var errorMessage = error.message;
		});
		return p;
	}

	mod.signInFacebook = async () => {
		let p = libx.newPromise();
		// Sign in Firebase using popup auth and Google as the identity provider.
		var provider = new mod.firebaseModule.firebaseProvider.auth.FacebookAuthProvider();
		provider.addScope("email");
		provider.addScope("public_profile");
		// provider.addScope("user_about_me");
		// provider.addScope("user_friends");

		provider.setCustomParameters({ 'display': 'popup' });

		if (mod.auth.currentUser != null && mod.auth.currentUser.isAnonymous)
			mod.auth.currentUser.linkWithPopup(provider).then(()=>p.resolve()).catch(ex=>p.reject(ex));
		else
			mod.auth.signInWithPopup(provider).then(()=>p.resolve()).catch(ex=>p.reject(ex));

		return p;
	};
	
	mod.signUpEmail = async (email, password) => {
		let p = libx.newPromise();
		mod.auth.createUserWithEmailAndPassword(email, password).then(()=>p.resolve()).catch(function(error) {
			libx.log.error('app:user:signInEmail: Error- ', error);
			var errorCode = error.code;
			var errorMessage = error.message;
			p.reject(error);
		});
		return p;
	};

	mod.signInEmail = async (email, password) => {
		let p = libx.newPromise();
		if (mod.auth.currentUser != null && mod.auth.currentUser.isAnonymous) {
			var credential = mod.auth.EmailAuthProvider.credential(email, password);
			mod.auth.currentUser.linkWithCredential(credential).then(function(user) {
				libx.log.verbose("Account linking success", user);
				mod.onAuthStateChanged(user);
				p.resolve(user);
			}, function(error) {
				libx.log.verbose("Account linking error", error);
				p.reject(error)
			});
			return;
		}
		
		mod.auth.signInWithEmailAndPassword(email, password).then(()=>p.resolve()).catch(function(error) {
			libx.log.verbose(' ! app:user:signInEmail: Error- ', error);
			p.reject(error);
			var errorCode = error.code;
			var errorMessage = error.message;
		});

		return p;
	}
	//#endregion
	
	mod.isSignedIn = function () {
		return mod.auth.currentUser != null;
	}

	mod.signOut = async function () {
		// Sign out of Firebase.
		await mod.auth.signOut();

		libx.browser.helpers.reload();
	};

	mod.refreshToken = async function () {
		libx.log.debug('userManager:refreshToken: ');

		mod.token = await mod._fbUser.getIdToken();

		return mod.token;
	}

	mod.onAuthStateChanged = async function (user) {
		libx.log.debug('userManager:onAuthStateChanged: ', user);

		mod.isReady = true;
		mod._fbUser = user;

		mod.onStatusChanged.trigger(user);

		if (!user) {
			mod.data = null;
			mod.onSignOut.trigger(mod.data);
			if (appEvents) appEvents.broadcast('user', { step:'signed-out' });
			return;
		}

		// await mod.refreshToken();

		if (mod.data == null) mod.data = {};

		if (!user.isAnonymous) {
			var obj = {
				profilePicUrl: user.photoURL, 
				email: user.email
			};
			libx.extend(mod.data, obj);
		} 
		mod.data.isAnonymous = user.isAnonymous;
		mod.data.id = user.uid;
		mod.writeData();
		mod.observeUser();

		if (appEvents) appEvents.broadcast('user', { step:'signed-in' });
		mod.onSignIn.trigger(mod.data);
	}

	mod.observeUser = function() {
		return firebaseModule.listen('/users/' + mod.data.id, data => {
			if (data != null && data.length == 1) data = data[0];
			libx.log.verbose('> user: user data changed', data)
			libx.extend(mod.data, data);
			if (appEvents) if (appEvents) appEvents.broadcast('user', { step:'user-updated' });
			mod.onDataChanged.trigger(mod.data);
		});
	}
	
	mod.observeProfile = function() {
		return firebaseModule.listen('/profiles/' + mod.data.id, data => {
			if (data != null && data.length == 1) data = data[0];
			libx.log.verbose('> user: profile data changed', data)

			libx.extend(mod.profile, data);

			if (libx.isEmpty(mod.profile)) { 
				libx.log.verbose('> user: profile is empty, taking from user object (login)')
				mod.profile = {};
				mod.profile.email = mod.data.email;
				if (mod.auth.currentUser.displayName != null) mod.profile.displayName = mod.auth.currentUser.displayName;
				else if (mod.data.displayName != null) mod.profile.displayName = mod.data.displayName;
				mod.profile.profilePicUrl = mod.data.profilePicUrl;
			}

			if (appEvents) appEvents.broadcast('user', { step:'profile-updated' });
			mod.onProfileChanged.trigger(mod.profile);
		});
	}

	mod.writeData = function() {		
		let p1 = firebaseModule.update('/users/' + mod.data.id, mod.data);
		let p2 = firebaseModule.update('/profiles/' + mod.data.id, mod.profile);
		if (appEvents) appEvents.broadcast('user', { step:'wrote-data' });

		Promise.all([p1, p2]);

		return;
	}

	// if ($rootScope.app == null) $rootScope.app = {};
	// $rootScope.mod = mod;
	// $rootScope.$on('fib-ready', function () {
	// 	mod.auth.onAuthStateChanged(mod.onAuthStateChanged.bind(this));
	// });

	mod.onSignIn.subscribe(()=>{
		mod.observeProfile();
		mod.observeUser();
	})

	mod.auth.onAuthStateChanged(mod.onAuthStateChanged.bind(this));

	return mod;
};

(()=>{ // Dependency Injector auto module registration
	__libx.di.register('UserManager', module.exports);
})();