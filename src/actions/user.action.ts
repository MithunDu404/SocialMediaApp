"use server"

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
    try {
        console.log("Starting user sync...");
        const {userId} = await auth();
        const user = await currentUser();
        if (!userId || !user) {
            console.error("User not authenticated");
            return; 
        }

        const existingUser = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (existingUser) {
            console.log("User already exists in the database, skipping creation.");
            return existingUser; // User already exists, no need to create again
        }

        const dbUser = await prisma.user.create({
            data: {
                clerkId: userId,
                name: `${user.firstName || ""} ${user.lastName || ""}`,
                username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                email: user.emailAddresses[0].emailAddress,
                image: user.imageUrl,
            },
        });

        return dbUser;
    }
    catch (error) {
        console.error("Error during user sync:", error);
        return;
    }
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}

export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  return user.id;
}