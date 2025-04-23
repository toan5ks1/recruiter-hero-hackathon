// import { auth } from "@/auth";

// import { prisma } from "@/lib/db";
// import { updateJobDescriptionSchema } from "@/lib/validations/jd";

// export const PUT = auth(async (req) => {
//   if (!req.auth) {
//     return new Response("Not authenticated", { status: 401 });
//   }

//   const currentUser = req.auth.user;
//   if (!currentUser?.id) {
//     return new Response("Invalid user", { status: 401 });
//   }

//   const url = new URL(req.url);
//   const id = url.pathname.split("/").pop(); // extract the ID from URL

//   if (!id) {
//     return new Response("Job Description ID is required", { status: 400 });
//   }

//   try {
//     const body = await req.json();
//     const parsed = updateJobDescriptionSchema.safeParse(body);

//     if (!parsed.success) {
//       return new Response(JSON.stringify(parsed.error.flatten()), {
//         status: 400,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     const existingJD = await prisma.jobDescription.findUnique({
//       where: { id },
//     });

//     if (!existingJD) {
//       return new Response("Job Description not found", { status: 404 });
//     }

//     if (existingJD.userId !== currentUser.id) {
//       return new Response("Unauthorized to update this Job Description", {
//         status: 403,
//       });
//     }

//     const updatedJD = await prisma.jobDescription.update({
//       where: { id },
//       data: {
//         title: parsed.data.title,
//         content: parsed.data.content,
//       },
//     });

//     return new Response(JSON.stringify(updatedJD), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("JD Update Error:", error);
//     return new Response("Internal server error", { status: 500 });
//   }
// });
