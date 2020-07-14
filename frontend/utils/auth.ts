// TODO: include this into `@vaadin/flow-frontend/Connect`
let _isLoggedIn = false;

export function isLoggedIn() {
  return _isLoggedIn;
}

export interface LoginResult {
  token?: string;
  error: boolean;
  errorTitle: string;
  errorMessage: string;
}

function getCsrfTokenFromResponseBody(body: string): string | undefined {
  const match = body.match(/window\.Vaadin = \{TypeScript: \{"csrfToken":"([0-9a-zA-Z\-]{36})"}};/i);
  return match ? match[1] : undefined;
}

export async function login(username: string, password: string): Promise<LoginResult> {
  let result;
  try {
    // this assumes the default Spring Security form login configuration (parameter names)
    const data = new FormData();
    data.append('username', username);
    data.append('password', password);

    const response = await fetch('/login', {method: 'POST', body: data});

    // this assumes the default Spring Security form login configuration (handler URL and responses)
    if (response.ok && response.redirected && response.url.endsWith('/login?error')) {
      _isLoggedIn = false;
      result = {
        error: true,
        errorTitle: 'Incorrect username or password.',
        errorMessage: 'Check that you have entered the correct username and password and try again.'
      };
    } else if (response.ok && response.redirected && response.url.endsWith('/')) {
      // TODO: find a more efficient way to get a new CSRF token
      // parsing the full response body just to get a token may be wasteful
      const token = getCsrfTokenFromResponseBody(await response.text());
      if (token) {
        (window as any).Vaadin.TypeScript.csrfToken = token;
        _isLoggedIn = true;
        result = {
          error: false,
          errorTitle: '',
          errorMessage: '',
          token: token
        };
      }
    }
  } catch (e) {
    // eat the exception
  }

  return result || {
    error: true,
    errorTitle: 'Communication error.',
    errorMessage: 'Please check your network connection and try again.',
  };
}

export async function logout() {
  _isLoggedIn = false;

  // this assumes the default Spring Security logout configuration (handler URL)
  const response = await fetch('/logout');

  // TODO: find a more efficient way to get a new CSRF token
  // parsing the full response body just to get a token may be wasteful
  const token = getCsrfTokenFromResponseBody(await response.text());
  (window as any).Vaadin.TypeScript.csrfToken = token;
}
