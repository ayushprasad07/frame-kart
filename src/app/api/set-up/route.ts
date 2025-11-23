import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    const pass = "SecureAdmin2110";
    const hashedPass = await bcrypt.hash(pass, 10);
    return Response.json({
        pass : hashedPass
    })
}