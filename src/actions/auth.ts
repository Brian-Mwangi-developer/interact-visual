"use server";

import { db } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function SaveUserToDb() {
    const user = await currentUser();
    if (!user) {
        throw new Error("User not authenticated");
    }
    let authUser = await db.user.findUnique({
        where: { clerkId: user.id }
    })
    if (!authUser) {
        authUser = await db.user.create({
            data: {
                email: user.emailAddresses[0]?.emailAddress,
                name: user.firstName ? `${user.firstName} ${user.lastName ?? ""}` : null,
                profileImage: user.imageUrl,
                clerkId: user.id,
            },
        });
    }
    if (!authUser) {
        return { status: 500, message: "Failed to create user" }
    }
    return { status: 201, user: authUser }

}   