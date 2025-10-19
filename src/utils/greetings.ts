/**
 * Greeting utilities for time-based greetings
 * @module greetings
 */

/**
 * Get time-based greeting message
 * @returns Greeting string based on current time
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'Good evening';
  } else {
    return 'Good night';
  }
}

/**
 * Get full greeting with user name
 * @param userName - User's name to include in greeting
 * @returns Complete greeting message
 */
export function getGreetingWithName(userName?: string): string {
  const greeting = getTimeBasedGreeting();
  const name = userName && userName.trim() ? userName : 'User';
  return `${greeting}, ${name}`;
}
