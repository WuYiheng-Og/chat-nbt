// import { Session } from './../node_modules/openai/resources/beta/realtime/sessions.d';
// import { Response } from './../node_modules/node-fetch/@types/index.d';
// import { Stripe } from 'stripe';
// import { api } from "./_generated/api";
// import { action } from "./_generated/server";

// export const pay = action({
//     args: {},
//     handler: async (ctx) => {
//         const clerkUser = await ctx.auth.getUserIdentity();
//         const user = await ctx.runQuery(api.users.currentUser, {});
//         if (!user || !clerkUser) {
//             throw new Error("User not authenticated!");
//         }
//         if (!clerkUser.emailVerified) {
//             throw new Error("User email not verified!");
//         }

//         const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
//             apiVersion: '2023-10-16'
//         });

//         const domain = process.env.NEXT_PUBLIC_HOSTING_URL!;

//         const session: Stripe.Response<Stripe.Checkout.Session> = await stripe.checkout.sessions.
//             create({
//                 mode: "subscription",
//                 line_items: [
//                     {
//                         price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID!,
//                         quantity: 1,
//                     }
//                 ],
//                 customer_email: clerkUser.email,
//                 metadata: {
//                     userId: user._id,
//                 },
//                 success_url: `${domain}`,
//                 cancel_url: `${domain}`
//             });
//         return session.url;
//     }
// })