import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Set a fixed date for tests to prevent snapshot mismatches due to time
vi.useFakeTimers();
vi.setSystemTime('2023-10-27T10:00:00.000Z');

// Mock Date.prototype.toLocaleString to return a fixed string
const fixedLocaleString = '2023/10/27 19:00'; // Example fixed time in JST
vi.spyOn(Date.prototype, 'toLocaleString').mockImplementation(() => fixedLocaleString);
