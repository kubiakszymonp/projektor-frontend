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

  getDecodedJwt(): { id: number } | null {
    const jwt = this.getJwt();
    if (!jwt) {
      return null;
    }
    const decoded = jwtDecode<{ organization: { id: number } }>(jwt);
    return decoded.organization;
  }
}
export const jwtPersistance = new JWTPersistance();
