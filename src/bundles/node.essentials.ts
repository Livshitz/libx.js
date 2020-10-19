import { libx as libxEssentials } from "./essentials";
import { node } from "../node/";

export const libx = {
	...libxEssentials,
	node,
}

export type ILibxNode = typeof libx;