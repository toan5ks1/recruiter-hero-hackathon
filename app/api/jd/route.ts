// import { NextResponse } from "next/server";
// import { auth } from "@/auth";

// import { prisma } from "@/lib/db";
// import { createJobDescriptionSchema } from "@/lib/validations/jd";

// export async function GET() {
//   const jds = await prisma.jobDescription.findMany();
//   return NextResponse.json(jds);
// }

// export const POST = auth(async (req) => {
//   if (!req.auth) {
//     return new Response("Not authenticated", { status: 401 });
//   }

//   const currentUser = req.auth.user;
//   if (!currentUser?.id) {
//     return new Response("Invalid user", { status: 401 });
//   }

//   try {
//     const body = await req.json();
//     const parsed = createJobDescriptionSchema.safeParse(body);

//     if (!parsed.success) {
//       return new Response(JSON.stringify(parsed.error.flatten()), {
//         status: 400,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     const jd = await prisma.jobDescription.create({
//       data: {
//         title: parsed.data.title,
//         content: parsed.data.content,
//         userId: currentUser.id,
//       },
//     });

//     return new Response(JSON.stringify(jd), {
//       status: 201,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("JD Creation Error:", error);
//     return new Response("Internal server error", { status: 500 });
//   }
// });
