import { di } from './dependencyInjector';
// import { Observable, Observer, ReplaySubject, BehaviorSubject, Subject, of, from } from 'rxjs';
import { ReplaySubject, BehaviorSubject, Subject, from, filter, take } from 'rxjs';

export interface IEvent<T> {
    payload: T;
    type?: string;
}

export type Action<T> = (event: IEvent<T>) => void;
export type Predicate<T> = (event: IEvent<T>, index?: number) => boolean;
export type Channels<T> = {
    history: ReplaySubject<IEvent<T>>; // emits all values since beginning
    state: BehaviorSubject<IEvent<T>>; // emits current value
    future: Subject<IEvent<T>>; // emits only future (without current) values
};
export type OneOfChannels<T> = ReplaySubject<IEvent<T>> | BehaviorSubject<IEvent<T>> | Subject<IEvent<T>>;

export enum ChannelTypes {
    History,
    State,
    Future,
}
export class EventsStream<T = any> {
    public channels: Channels<T> = {
        history: new ReplaySubject<IEvent<T>>(), // emits all values since beginning
        state: new BehaviorSubject<IEvent<T>>(null), // emits current value
        future: new Subject<IEvent<T>>(), // emits only future (without current) values
    };
    private _defaultPredicate = (event: IEvent<T>, index?: number) => true;

    public constructor(initialEvents?: IEvent<T>[]) {
        from<IEvent<T>[]>(initialEvents || [])
            .pipe()
            .subscribe((i) => this.emit(i.payload, i.type));
    }

    public subscribe(action: Action<T>, predicate?: Predicate<T>, channel?: OneOfChannels<T>) {
        if (predicate == null) predicate = this._defaultPredicate;
        return (channel || this.channels.state).pipe(filter(predicate)).subscribe(action);
    }

    public subscribeOnce(action: Action<T>, predicate?: Predicate<T>, channel?: OneOfChannels<T>) {
        if (predicate == null) predicate = this._defaultPredicate;
        return (channel || this.channels.future).pipe(filter(predicate), take(1)).subscribe(action);
    }

    public emit(payload: T, type?: string) {
        var ev = this.newEvent(payload, type);
        this.channels.history.next(ev);
        this.channels.state.next(ev);
        this.channels.future.next(ev);
    }

    public unsubscribe(handler) {
        handler.unsubscribe();
    }

    public getAll(transformer?: (ev: IEvent<T>) => any, predicate?: Predicate<T>): IEvent<T>[] {
        const ret: IEvent<T>[] = [];
        if (predicate == null) predicate = this._defaultPredicate;

        this.channels.history.pipe(filter(predicate)).forEach((ev) => ret.push(transformer ? transformer(ev) : ev));
        return ret;
    }

    private newEvent(payload, type) {
        return { payload, type };
    }
}

di.register('EventsStream', EventsStream);
