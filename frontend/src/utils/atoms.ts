import { atom } from "jotai";
import { type Pattern } from "./types";
export const drawingDataAtom = atom<string>("");
export const patternAtom = atom<Pattern[]>([]);
export const curPatternAtom = atom<Pattern | null>(null);
export const isModalOpenAtom = atom<boolean>(false);
