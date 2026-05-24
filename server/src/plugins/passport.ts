import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
  VerifyCallback,
} from "passport-google-oauth20";
import {
  Strategy as GitHubStrategy,
  Profile as GitHubProfile,
} from "passport-github2";
import {
  Strategy as FacebookStrategy,
  Profile as FacebookProfile,
} from "passport-facebook";
import UserService from "@/services/UserService";
import { logger } from "@/plugins/winston";

export enum AuthProvider {
  GOOGLE = "google",
  GITHUB = "github",
  FACEBOOK = "facebook",
  LOCAL = "local",
}

const availableProviders = new Set<string>();

export function isProviderConfigured(provider: string): boolean {
  return availableProviders.has(provider);
}

export function configurePassport() {
  const backendDomain = process.env.BACKEND_DOMAIN;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
  const facebookAppId = process.env.FACEBOOK_APP_ID;
  const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;

  if (!backendDomain) {
    logger.warn(
      "BACKEND_DOMAIN is not configured; social login providers will not be initialized",
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await UserService.findById(id);
      done(null, user);
    } catch (error) {
      logger.error(
        `Passport deserializeUser failed for id=${id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      done(error);
    }
  });

  if (googleClientId && googleClientSecret && backendDomain) {
    availableProviders.add(AuthProvider.GOOGLE);
    logger.info("Google OAuth provider configured");
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: `${backendDomain}/auth/google/callback`,
        },
        async (
          _accessToken: string,
          _refreshToken: string,
          profile: GoogleProfile,
          done: VerifyCallback,
        ) => {
          const email = profile.emails?.[0]?.value ?? null;
          const displayName = profile.displayName ?? null;
          logger.debug(
            `Google social auth callback received for id=${profile.id} emailPresent=${Boolean(email)}`,
          );
          try {
            const user = await UserService.findOrCreateSocialUser(
              AuthProvider.GOOGLE,
              profile.id,
              email,
              displayName,
            );
            logger.info(
              `Google social auth succeeded for socialId=${profile.id} userId=${user.id}`,
            );
            done(null, user);
          } catch (error) {
            logger.error(
              `Google social auth failed for socialId=${profile.id}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            done(error as Error);
          }
        },
      ),
    );
  } else {
    logger.warn(
      "Google OAuth provider is not fully configured; check GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and BACKEND_DOMAIN",
    );
  }

  if (githubClientId && githubClientSecret && backendDomain) {
    availableProviders.add(AuthProvider.GITHUB);
    logger.info("GitHub OAuth provider configured");
    passport.use(
      new GitHubStrategy(
        {
          clientID: githubClientId,
          clientSecret: githubClientSecret,
          callbackURL: `${backendDomain}/auth/github/callback`,
          scope: ["user:email"],
        },
        async (
          _accessToken: string,
          _refreshToken: string,
          profile: GitHubProfile,
          done: VerifyCallback,
        ) => {
          const email = profile.emails?.[0]?.value ?? null;
          const displayName = profile.displayName ?? null;
          logger.debug(
            `GitHub social auth callback received for id=${profile.id} emailPresent=${Boolean(email)}`,
          );
          try {
            const user = await UserService.findOrCreateSocialUser(
              AuthProvider.GITHUB,
              profile.id,
              email,
              displayName,
            );
            logger.info(
              `GitHub social auth succeeded for socialId=${profile.id} userId=${user.id}`,
            );
            done(null, user);
          } catch (error) {
            logger.error(
              `GitHub social auth failed for socialId=${profile.id}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            done(error as Error);
          }
        },
      ),
    );
  } else {
    logger.warn(
      "GitHub OAuth provider is not fully configured; check GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and BACKEND_DOMAIN",
    );
  }

  if (facebookAppId && facebookAppSecret && backendDomain) {
    availableProviders.add(AuthProvider.FACEBOOK);
    logger.info("Facebook OAuth provider configured");
    passport.use(
      new FacebookStrategy(
        {
          clientID: facebookAppId,
          clientSecret: facebookAppSecret,
          callbackURL: `${backendDomain}/auth/facebook/callback`,
          profileFields: ["id", "emails", "displayName", "name"],
        },
        async (
          _accessToken: string,
          _refreshToken: string,
          profile: FacebookProfile,
          done: VerifyCallback,
        ) => {
          const email = profile.emails?.[0]?.value ?? null;
          const displayName = profile.displayName ?? null;
          logger.debug(
            `Facebook social auth callback received for id=${profile.id} emailPresent=${Boolean(email)}`,
          );
          try {
            const user = await UserService.findOrCreateSocialUser(
              AuthProvider.FACEBOOK,
              profile.id,
              email,
              displayName,
            );
            logger.info(
              `Facebook social auth succeeded for socialId=${profile.id} userId=${user.id}`,
            );
            done(null, user);
          } catch (error) {
            logger.error(
              `Facebook social auth failed for socialId=${profile.id}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            done(error as Error);
          }
        },
      ),
    );
  } else {
    logger.warn(
      "Facebook OAuth provider is not fully configured; check FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, and BACKEND_DOMAIN",
    );
  }
}
