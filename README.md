## 本项目来自ChatNBT团队，我们是一支年轻的团队，欢迎给我们提PR
## 如何联系我们：
### QQ email:3289990188@qq.com  Google email:dshen4237@gmail.com
### 技术栈：Nextjs+React+convex+tailwindcss+TypeScript+ShadCN+clerk+vercel
### github仓库地址：https://github.com/daisenqiu399/chatNBT

## [项目已经上线,点击体验](https://chat-nbt-ar5g-eight.vercel.app/)

以下是本仓库的教程
本项目基于Youtub @Vuk Rosić (Beam.AI)作者的开源，二次开发，感谢开源！
![ChatGPT Clone](https://i.ytimg.com/vi/_Aeu7BcMoeY/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLBENGf8oDCq4nwdPXo0AFVaAy1DMQ)

[视频教程](https://youtu.be/_Aeu7BcMoeY?si=f4c4QoosSys86sOV)

### 运行效果如下
![Screenshot_1](https://github.com/daisenqiu399/chatNBT/blob/main/public/demo.png)
## 如果你想运行代码，按照如下步骤

## Required:
Node version 14.x

## Clone this repo
```bash
git clone https://github.com/vukrosic/nextjs14-chatgpt
```

## Install packages
```bash
cd nextjs14-chatgpt & npm install
```

## Run Convex
```bash
npx convex dev
```

You will need to setup Clerk, Convex and other things. Don't forget to add your variables to convex website as well. Here is example .env.local file:

```env
# Deployment used by `npx convex dev`
CONVEX_DEPLOYMENT=dev:fiery-gopher-967 # team: dai-sen-qiu, project: nextjs14-chatgpt-9a539

NEXT_PUBLIC_CONVEX_URL=https://fiery-gopher-967.convex.cloud

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2hhbXBpb24tcm9vc3Rlci0zMC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_eiZ8crlm4RzfARl2g6kkIEp0fNWFOWbQYS1JGdhDGb


MOONSHOT_API_KEY=sk-LhTtJlSG4Oe1UjDUA8yvznzp8cXDiLNrl3OAJZZHkcqNue39

NEXT_PUBLIC_HOSTING_URL=localhost:3000

STRIPE_SUBSCRIPTION_PRICE_ID=
NEXT_STRIPE_SECRET_KEY=
```

## Run the app
```bash
npm run dev
```

At this point, you application should work, but it probably doesn't. You may check timesteps in the video description or try to read and solve errors by yourself. You can also ask in comments.





# Next JS documentation below

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
