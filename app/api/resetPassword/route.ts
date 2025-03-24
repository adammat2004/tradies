import prisma from '@/app/libs/prismadb';
import crypto from "crypto";

export const resetPassword = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email,
        }
    })
    if(!user){
        throw new Error("User not found");
    }
    const resetPasswordToken = crypto.randomBytes(32).toString("base64url");
    const today = new Date();
    const expiry = new Date(today.setDate(today.getDate() + 1));

    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpires: expiry,
        }
    })

}