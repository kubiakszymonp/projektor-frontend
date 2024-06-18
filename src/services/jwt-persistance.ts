import { jwtDecode } from "jwt-decode";

export class JWTPersistance {
  saveJwt(jwt: string) {
    localStorage.setItem("jwt", jwt);
  }

  getJwt() {
    return localStorage.getItem("jwt");
  }

  removeJwt() {
    localStorage.removeItem("jwt");
  }

  JwtExists() {
    return localStorage.getItem("jwt") !== null;
  }

  getDecodedJwt(): {
    email: string;
    id: string;
    role: string;
    organizationId: string;
  } | null {
    const jwt = this.getJwt();
    if (!jwt) {
      return null;
    }
    const decoded = jwtDecode<{
      email: string;
      id: string;
      role: string;
      organizationId: string;
    }>(jwt);
    return decoded;
  }
}
export const jwtPersistance = new JWTPersistance();
