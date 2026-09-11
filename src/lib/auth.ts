import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export type UserRole = "TRAINEE" | "TRAINER" | "TRAINING_PROVIDER" | "GOVERNMENT_ADMIN" | "EMPLOYER" | "ADMINISTRATOR";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/signin",
    newUser: "/onboarding",
    error: "/signin",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "CareerLoop Account",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@careerloop.gov.in" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
        expectedRole: { label: "Expected Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Please enter your email address.");
        }

        const email = credentials.email.toLowerCase().trim();

        // 1. Check if user exists in DB
        let user = await prisma.user.findUnique({
          where: { email },
          include: {
            traineeProfile: true,
            employerProfile: true,
            providerProfile: true,
            trainerProfile: true,
          },
        });

        // If user does not exist and a password was supplied, create user if onboarding or demo
        if (!user) {
          const role = credentials.expectedRole || credentials.role || "TRAINEE";
          const hashedPassword = credentials.password 
            ? await bcrypt.hash(credentials.password, 10) 
            : await bcrypt.hash("CareerLoop2026!", 10);

          const isTrainee = role === "TRAINEE" || role === "STUDENT";
          user = await prisma.user.create({
            data: {
              email,
              name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, l => l.toUpperCase()),
              passwordHash: hashedPassword,
              role: role === "STUDENT" ? "TRAINEE" : role,
              adminApproved: role === "GOVERNMENT_ADMIN" || role === "ADMINISTRATOR" ? true : false,
              ...(isTrainee ? {
                traineeProfile: {
                  create: {
                    traineeId: `CLP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
                    district: "National",
                    state: "National",
                  },
                },
              } : {}),
            },
            include: {
              traineeProfile: true,
              employerProfile: true,
              providerProfile: true,
              trainerProfile: true,
            },
          });
        } else if (credentials.password && user.passwordHash) {
          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValid) {
            throw new Error("Invalid password credentials.");
          }
        }

        // 2. Strict Role-Based Access Control: Validate expected role against authorized account role
        if (credentials.expectedRole) {
          const expected = credentials.expectedRole.toUpperCase().trim();
          const actual = user.role.toUpperCase().trim();

          const isMatch =
            expected === actual ||
            (expected === "STUDENT" && actual === "TRAINEE") ||
            (expected === "TRAINEE" && actual === "STUDENT") ||
            (expected === "PROVIDER" && actual === "TRAINING_PROVIDER") ||
            (expected === "GOVERNMENT" && (actual === "GOVERNMENT_ADMIN" || actual === "ADMINISTRATOR")) ||
            (expected === "ADMIN" && (actual === "GOVERNMENT_ADMIN" || actual === "ADMINISTRATOR")) ||
            (expected === "ADMINISTRATOR" && (actual === "GOVERNMENT_ADMIN" || actual === "ADMINISTRATOR"));

          if (!isMatch) {
            throw new Error(
              `Access Denied: This account (${user.email}) is registered as a ${actual.replace(/_/g, " ")}, and is not authorized to access the ${expected.replace(/_/g, " ")} portal.`
            );
          }
        }

        // Normalize STUDENT → TRAINEE for backward-compat legacy accounts
        if (user.role === "STUDENT") {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "TRAINEE" },
          });
          user = { ...user, role: "TRAINEE" } as typeof user;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          adminApproved: user.adminApproved,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "TRAINEE";
        token.adminApproved = (user as any).adminApproved || false;
      }

      if (trigger === "update" && session?.role) {
        token.role = session.role;
        token.adminApproved = session.adminApproved;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).adminApproved = token.adminApproved as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user as {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role: "TRAINEE" | "TRAINER" | "TRAINING_PROVIDER" | "GOVERNMENT_ADMIN" | "EMPLOYER" | "ADMINISTRATOR";
    adminApproved: boolean;
  } | null;
}
