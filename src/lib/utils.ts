import { twMerge } from 'tailwind-merge';

type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | { [key: string]: any }
  | ClassValue[];

function classNames(...args: ClassValue[]): string {
  let classes = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg) {
      classes = appendClass(classes, parseValue(arg));
    }
  }

  return classes;
}

function parseValue(arg: any): string {
  if (typeof arg === 'string' || typeof arg === 'number') {
    return String(arg);
  }

  if (Array.isArray(arg)) {
    if (arg.length) {
      return classNames(...arg);
    }
    return '';
  }

  if (typeof arg === 'object') {
    if (
      arg.toString !== Object.prototype.toString &&
      !arg.toString.toString().includes('[native code]')
    ) {
      return arg.toString();
    }

    let inner = '';
    for (const key in arg) {
      if (Object.hasOwn(arg, key) && arg[key]) {
        inner = appendClass(inner, key);
      }
    }
    return inner;
  }

  return '';
}

function appendClass(value: string, newClass: string): string {
  if (!newClass) return value;
  if (value) return `${value} ${newClass}`;
  return newClass;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(classNames(inputs));
}

export function count(arr: Array<any> | number, singular = 'item', plural?: string) {
  const n = typeof arr === 'number' ? arr : arr.length;
  return `${n} ${n === 1 ? singular : plural || `${singular}s`}`;
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay = 1000 // 1 sec
): (...args: Parameters<T>) => void {
  // Use an AbortController for better cleanup
  let abortController: AbortController | null = null;

  return function (this: any, ...args: Parameters<T>) {
    // If there's a pending execution, abort it
    if (abortController) {
      abortController.abort();
    }

    // Create a new abort controller for this execution
    abortController = new AbortController();
    const { signal } = abortController;

    // Create a promise that resolves after the delay
    const delayPromise = new Promise<void>((resolve, reject) => {
      // Setup the timeout
      const timeoutId = setTimeout(() => {
        resolve();
      }, delay);

      // If aborted, clear the timeout and reject
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('Debounce aborted'));
      });
    });

    // Execute the function after the delay if not aborted
    delayPromise
      .then(() => {
        if (!signal.aborted) {
          func.apply(this, args);
        }
        abortController = null;
      })
      .catch(() => {
        // Aborted, do nothing
      });
  };
}

export const { format: formatCurrency } = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function slug(str: string) {
  return str
    .toLowerCase()
    .replace(/[\s\W]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
