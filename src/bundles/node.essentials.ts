import { libx as libxEssentials } from './essentials';
import { node } from '../node/';
import { objectExtensions } from '../extensions/ObjectExtensions';

export const libx = objectExtensions.extend(libxEssentials, { node });

export type ILibxNode = typeof libx;
