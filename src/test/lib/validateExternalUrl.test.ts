import { describe, expect, it } from 'vitest';
import { validateExternalUrl } from '@/lib/validateExternalUrl';

describe('validateExternalUrl', () => {
  it('should allow valid http URLs', () => {
    expect(validateExternalUrl('http://example.com')).toBe('http://example.com/');
    expect(validateExternalUrl('http://example.com/path')).toBe('http://example.com/path');
  });

  it('should allow valid https URLs', () => {
    expect(validateExternalUrl('https://example.com')).toBe('https://example.com/');
    expect(validateExternalUrl('https://google.com?q=test')).toBe('https://google.com/?q=test');
  });

  it('should allow mailto links', () => {
    expect(validateExternalUrl('mailto:user@example.com')).toBe('mailto:user@example.com');
  });

  it('should allow tel links', () => {
    expect(validateExternalUrl('tel:+1234567890')).toBe('tel:+1234567890');
  });

  it('should allow anchor links', () => {
    expect(validateExternalUrl('#section')).toBe('#section');
  });

  it('should allow relative paths', () => {
    expect(validateExternalUrl('/local/path')).toBe('/local/path');
    expect(validateExternalUrl('?query=param')).toBe('?query=param');
  });

  it('should reject javascript: protocol', () => {
    expect(validateExternalUrl('javascript:alert(1)')).toBeNull();
  });

  it('should reject data: protocol', () => {
    expect(validateExternalUrl('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==')).toBeNull();
  });

  it('should reject file: protocol', () => {
    expect(validateExternalUrl('file:///etc/passwd')).toBeNull();
  });

  it('should reject vbscript: protocol', () => {
    expect(validateExternalUrl('vbscript:msgbox("hello")')).toBeNull();
  });

  it('should reject invalid URLs', () => {
    expect(validateExternalUrl('not a url')).toBeNull();
  });

  it('should return null for empty input', () => {
    expect(validateExternalUrl('')).toBeNull();
  });
});
