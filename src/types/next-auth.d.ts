import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      accessToken?: string;
      refreshToken?: string;
      username?: string;
    } & DefaultSession["user"];
    error?: string;
  }
}
