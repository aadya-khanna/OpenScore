// Type declarations for React loaded from CDN
declare module 'react' {
  export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useRef<T>(initialValue: T): { current: T };
  export function createElement(type: any, props?: any, ...children: any[]): any;
  export default {
    useState,
    useEffect,
    useRef,
    createElement
  };
}
