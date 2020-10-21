import { libx as libxEssentials } from './essentials';
import { node } from '../node/';
import { ObjectExtensions } from '../extensions/ObjectExtensions';

export const libx = ObjectExtensions.extend(libxEssentials, { node });

export type ILibxNode = typeof libx;
