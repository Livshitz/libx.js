import { di } from "./dependencyInjector";
import { EventsStore } from "./EventsStore";

export let appEvents: EventsStore;
di.registerResolve('appEvents', (rxjs) => {
	if (typeof rxjs == "undefined") return; // just use the variable so the compile will not exclude it
	return appEvents = new EventsStore();
});
