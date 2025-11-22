import { Redirect } from 'expo-router';

/**
 * Index route - redirects to sign-in page on app load
 * This is the entry point and should always redirect to sign-in
 */
export default function Index() {
  return <Redirect href="/sign-in" />;
}

