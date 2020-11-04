export class AudioPlayer {
    public isInitialized = false;
    private _resource: string;
    private _audioObject: HTMLAudioElement;
    private _options = {
        loop: true,
        volume: 1,
    };

    constructor() {}

    public set(resource?: string, options?: AudioPlayer['_options']) {
        if (resource != null) this._resource = resource;
        if (this._resource == null) throw 'AudioPlayer: No resource provided!';

        if (options != null) this._options = { ...this._options, ...options };

        this._audioObject = new Audio(this._resource + '?cb=' + new Date().getTime());
        this._audioObject.loop = this._options.loop;
        this._audioObject.volume = this._options.volume;
        this.isInitialized = true;
    }

    public play() {
        this._audioObject.play();
    }

    public pause() {
        this._audioObject.pause();
    }

    public stop() {
        this._audioObject.pause();
        this._audioObject.currentTime = 0;
    }
}
