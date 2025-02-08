// import type { NextApiRequest, NextApiResponse } from 'next';
// import OSS from 'ali-oss'; 

// // 使用预签名 URL,因为客户端无法直接访问环境变量，为了安全起见。 
// // 创建阿里云客户端
// const aliClient = new OSS({
//     region: process.env.ALI_OSS_REGION,
//     accessKeyId: process.env.ALI_OSS_ACCESS_KEY_ID!,
//     accessKeySecret: process.env.ALI_OSS_ACCESS_KEY_SECRET!,
//     bucket: process.env.ALI_OSS_BUCKET
// })

// // 这里bucket存储的资源是私有的，公有要钱，只能这样曲线救国
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     const { key } = req.query;
//     if (typeof key!== 'string') {
//         return res.status(400).send('Invalid key');
//     }
//     const url = await aliClient.signatureUrl(`attachments/${key}`,{
//         expires: 3600 // URL有效1h
//     });
//     if(url) {
//         // console.log(url);
//         res.send(url);
//     } else {
//         res.status(500).send('Error generating presigned URL');
//     }
//     // const params = {
//     //     Bucket: 'your-bucket-name',
//     //     Key: key,
//     //     Expires: 3600 // URL 有效期为 1 小时
//     // };

//     // s3.getSignedUrl('getObject', params, (err, url) => {
//     //     if (err) {
//     //         res.status(500).send('Error generating presigned URL');
//     //     } else {
//     //         res.send(url);
//     //     }
//     // });

// }