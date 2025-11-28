
export type Tokens = {
  access_token: string;
  //refreshToken: string;
  token_type: string;
};

class TokenProvider {
  tokens: Tokens | null = null;

   setToken(token: Tokens) {
    this.tokens = token;
    localStorage.setItem('auth_token', token.access_token);
  }

   getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

   clearToken() {
    localStorage.removeItem('auth_token');
    this.tokens = null;
  }

  hasToken(): boolean {
    return this.getToken() !== null;
  }
}

const tokenProvider = new TokenProvider();

export default tokenProvider;
