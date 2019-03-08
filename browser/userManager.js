module.exports = function(firebaseProvider){
	var mod = {};
	mod.firebase = firebaseProvider;
	mod.firebase._auth = mod.firebase.auth();
	mod.profile = {};

	mod.test = ()=> console.log('userManager!');

	mod.signInGoogle = function () {
		// Sign in Firebase using popup auth and Google as the identity provider.
		var provider = new mod.firebase._auth.GoogleAuthProvider();
		
		if (mod.firebase._auth.currentUser != null && mod.firebase._auth.currentUser.isAnonymous)
			mod.firebase._auth.currentUser.linkWithPopup(provider)
		else
			mod.firebase._auth.signInWithPopup(provider);
	};

	mod.signInAnon = function(displayName) {
		if (mod.data == null) mod.data = {};

		if (mod.profile.data == null) mod.profile.data = {};
		mod.profile.data.displayName = displayName;
		mod.firebase._auth.signInAnonymously().then(function (u) {
			console.log(' > app:user: Got anon user');
		}).catch(function (error) {
			console.log(' ! app:user: Failed to get anon user', error);
			// var errorCode = error.code;
			// var errorMessage = error.message;
		});
	}

	return mod;
}
